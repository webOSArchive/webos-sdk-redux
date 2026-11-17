/*
 * Luna DE, on this machine.
 *
 * Luna DE (Lunacy's desktop shell, https://github.com/webOSArchive/Lunacy, branch luna-de) runs
 * webOS apps on Linux, macOS and Windows for developers, and serves novacomd's device side on a
 * Unix-domain socket of the user running it. This finds every running copy and lists it beside
 * the USB, TCP and adb devices, so novacom and the palm-* tools reach it like any other device:
 *
 *     $ novacom -l
 *     44079 c37f7a3418b2688e6d933844b48ba803061b4fac usb topaz-linux
 *     45233 5e0c7d1a9b8f6e4d3c2b1a0f9e8d7c6b5a493827 local luna-de
 *
 * As adb_relay.c does for Lunacy on Android, nothing is added to the novacom protocol: each
 * client connection made to a copy's port is spliced, byte for byte, to a fresh connection to
 * its socket, and Luna DE answers as a device's novacomd answers a channel. Its nduid is read
 * the way a client reads it, `get file:///proc/nduid`.
 *
 * Where the sockets are (DesktopNovacom.kt in Lunacy):
 *   Linux         /run/user/<uid>/luna-de/novacom-<pid>.sock, in the user's runtime folder
 *                 ($XDG_RUNTIME_DIR), which systemd's PrivateTmp doesn't hide;
 *   macOS         /tmp/luna-de-<uid>/novacom-<pid>.sock (and Linux without a runtime folder).
 *                 Either way in a folder of that user's that only they can open. A folder or
 *                 socket owned by anyone else is passed over, so nobody can list a device in
 *                 another user's name.
 *   Windows       %ProgramData%\luna-de\novacom-<pid>.sock (AF_UNIX, Windows 10 1803 and later).
 *
 * Turn the search off with -L (--no-local).
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <poll.h>
#include <pthread.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/socket.h>
#include <sys/time.h>
#ifdef _WIN32
#include <afunix.h>
#include <windows.h>
#else
#include <sys/un.h>
#include <dirent.h>
#endif

#include "debug.h"
#include "log.h"
#include "platform.h"
#include "novacom.h"
#include "../novacomd_p.h"
#include "local_relay.h"

#define LOCAL_CONNTYPE    "local"
#define LOCAL_DEVTYPE     "luna-de"
#define POLL_SECONDS      3
#define IO_TIMEOUT_MS     3000
#define PACKET_MAGIC      0xdecafbad
#define PATH_MAX_LEN      512

int g_local_relay = 1;

typedef struct relay {
	struct relay *next;
	char nduid[NOVACOM_NDUID_STRLEN];
	char path[PATH_MAX_LEN];
	SOCKET listen;
	int port;
	volatile int closing;
	int seen;                  /* found by this pass of the search */
} relay_t;

static relay_t *relays;
static pthread_mutex_t relays_mutex = PTHREAD_MUTEX_INITIALIZER;

/* ---- the sockets ---- */

static int write_all(int fd, const void *buf, size_t len)
{
	const char *p = buf;
	while (len > 0) {
		ssize_t n = send(fd, p, len, 0);
		if (n < 0 && errno == EINTR) continue;
		if (n <= 0) return -1;
		p += n;
		len -= n;
	}
	return 0;
}

static int read_all(int fd, void *buf, size_t len)
{
	char *p = buf;
	while (len > 0) {
		ssize_t n = recv(fd, p, len, 0);
		if (n < 0 && errno == EINTR) continue;
		if (n <= 0) return -1;
		p += n;
		len -= n;
	}
	return 0;
}

static void set_timeout(int fd, int ms)
{
#ifdef _WIN32
	DWORD tv = ms;
#else
	struct timeval tv;
	tv.tv_sec = ms / 1000;
	tv.tv_usec = (ms % 1000) * 1000;
#endif
	setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, (const char *)&tv, sizeof(tv));
	setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, (const char *)&tv, sizeof(tv));
}

/* A connection to one copy's socket, or -1. */
static int open_luna_de(const char *path, int timeout_ms)
{
	struct sockaddr_un addr;
	int fd;
	if (strlen(path) >= sizeof(addr.sun_path)) return -1;
	fd = socket(AF_UNIX, SOCK_STREAM, 0);
	if (fd < 0) return -1;
	memset(&addr, 0, sizeof(addr));
	addr.sun_family = AF_UNIX;
	strcpy(addr.sun_path, path);
	if (timeout_ms) set_timeout(fd, timeout_ms);
	if (connect(fd, (struct sockaddr *)&addr, sizeof(addr)) != 0) {
		platform_closesocket(fd);
		return -1;
	}
	return fd;
}

/* ---- Luna DE ---- */

static int read_reply(int fd, char *line, size_t size)
{
	size_t i = 0;
	while (i + 1 < size) {
		char c;
		if (read_all(fd, &c, 1) < 0) return -1;
		if (c == '\n') break;
		line[i++] = c;
	}
	line[i] = 0;
	return 0;
}

static uint32_t le32(const unsigned char *b)
{
	return b[0] | (b[1] << 8) | (b[2] << 16) | ((uint32_t)b[3] << 24);
}

/* A copy's nduid, read with `get file:///proc/nduid`, or -1 if it isn't answering. */
static int luna_de_nduid(const char *path, char nduid[NOVACOM_NDUID_STRLEN])
{
	const char *cmd = "get file:///proc/nduid\n";
	char line[64], data[128];
	size_t got = 0;
	int fd = open_luna_de(path, IO_TIMEOUT_MS);
	int rc = -1;
	if (fd < 0) return -1;
	if (write_all(fd, cmd, strlen(cmd)) < 0 || read_reply(fd, line, sizeof(line)) < 0 || strcmp(line, "ok 0") != 0)
		goto done;
	for (;;) {
		unsigned char h[16];
		uint32_t size, type;
		if (read_all(fd, h, sizeof(h)) < 0 || le32(h) != PACKET_MAGIC) goto done;
		size = le32(h + 8);
		type = le32(h + 12);
		if (size > 4096) goto done;
		{
			unsigned char payload[4096];
			if (size && read_all(fd, payload, size) < 0) goto done;
			if (type == 0 && got + size < sizeof(data)) {
				memcpy(data + got, payload, size);
				got += size;
			} else if (type == 2 && size >= 8 && le32(payload) == 2) {
				break;      /* the return code: done */
			}
		}
	}
	while (got && (data[got - 1] == '\n' || data[got - 1] == '\r')) got--;
	if (got != NOVACOM_NDUID_CHRLEN) goto done;
	memcpy(nduid, data, got);
	nduid[got] = 0;
	rc = 0;
done:
	platform_closesocket(fd);
	return rc;
}

/* ---- relaying ---- */

typedef struct splice_args {
	int client;
	char path[PATH_MAX_LEN];
} splice_args_t;

/* Copies both ways between a client and Luna DE until either end closes. */
static void *splice_thread(void *arg)
{
	splice_args_t *a = arg;
	int device = open_luna_de(a->path, 0);
	char buf[16384];

	if (device >= 0) {
		struct pollfd fds[2];
		fds[0].fd = a->client;
		fds[0].events = POLLIN;
		fds[1].fd = device;
		fds[1].events = POLLIN;
		for (;;) {
			int i, done = 0;
			if (poll(fds, 2, -1) < 0) {
				if (errno == EINTR) continue;
				break;
			}
			for (i = 0; i < 2 && !done; i++) {
				if (fds[i].revents & (POLLIN | POLLHUP | POLLERR)) {
					ssize_t n = recv(fds[i].fd, buf, sizeof(buf), 0);
					if (n <= 0 || write_all(fds[1 - i].fd, buf, n) < 0)
						done = 1;
				}
			}
			if (done) break;
		}
		platform_closesocket(device);
	} else {
		/* As a device's novacomd answers a command it can't start. */
		const char *reply = "device not responding\n";
		write_all(a->client, reply, strlen(reply) + 1);
	}
	platform_closesocket(a->client);
	platform_free(a);
	return NULL;
}

/* Accepts clients on one copy's port. Owns the relay; frees it once it is closing. */
static void *accept_thread(void *arg)
{
	relay_t *r = arg;
	while (!r->closing) {
		struct pollfd p;
		p.fd = r->listen;
		p.events = POLLIN;
		if (poll(&p, 1, 1000) <= 0) continue;
		{
			SOCKET c = accept_socket(r->listen);
			pthread_t t;
			splice_args_t *a;
			if (c == INVALID_SOCKET) continue;
			a = platform_calloc(sizeof(*a));
			if (!a) { platform_closesocket(c); continue; }
			a->client = c;
			snprintf(a->path, sizeof(a->path), "%s", r->path);
			if (pthread_create(&t, NULL, splice_thread, a) == 0) {
				pthread_detach(t);
			} else {
				platform_closesocket(c);
				platform_free(a);
			}
		}
	}
	platform_closesocket(r->listen);
	platform_free(r);
	return NULL;
}

static void add_relay(const char *path, const char *nduid)
{
	pthread_t t;
	relay_t *r = platform_calloc(sizeof(*r));
	if (!r) return;
	snprintf(r->path, sizeof(r->path), "%s", path);
	snprintf(r->nduid, sizeof(r->nduid), "%s", nduid);
	r->listen = create_listen_socket(0, g_listen_all);
	if (r->listen == INVALID_SOCKET) {
		platform_free(r);
		return;
	}
	r->port = get_socket_port(r->listen);
	r->seen = 1;
	TRACEL(LOG_ALWAYS, "dev '%s' via %s type %s (%s)\n", nduid, LOCAL_CONNTYPE, LOCAL_DEVTYPE, path);
	pthread_mutex_lock(&relays_mutex);
	r->next = relays;
	relays = r;
	pthread_mutex_unlock(&relays_mutex);
	if (pthread_create(&t, NULL, accept_thread, r) == 0) {
		pthread_detach(t);
	} else {
		pthread_mutex_lock(&relays_mutex);
		relays = r->next;
		pthread_mutex_unlock(&relays_mutex);
		platform_closesocket(r->listen);
		platform_free(r);
	}
}

/* Whether a relay already serves this copy (its socket and nduid); marks it seen. */
static int have(const char *path, const char *nduid)
{
	relay_t *r;
	int found = 0;
	pthread_mutex_lock(&relays_mutex);
	for (r = relays; r; r = r->next) {
		if (strcasecmp(r->nduid, nduid) == 0 && strcmp(r->path, path) == 0) {
			r->seen = 1;
			found = 1;
			break;
		}
	}
	pthread_mutex_unlock(&relays_mutex);
	return found;
}

/* One socket file found: listed if a copy of Luna DE answers on it. */
static void found(const char *path)
{
	char nduid[NOVACOM_NDUID_STRLEN];
	if (luna_de_nduid(path, nduid) < 0) return;
	if (!have(path, nduid)) add_relay(path, nduid);
}

static int is_socket_name(const char *name)
{
	size_t n = strlen(name);
	return strncmp(name, "novacom-", 8) == 0 && n > 13 && strcmp(name + n - 5, ".sock") == 0;
}

#ifdef _WIN32

static void search(void)
{
	char dir[MAX_PATH], pattern[MAX_PATH + 32], path[PATH_MAX_LEN];
	WIN32_FIND_DATAA fd;
	HANDLE h;
	DWORD n = GetEnvironmentVariableA("ProgramData", dir, sizeof(dir));
	if (n == 0 || n >= sizeof(dir)) snprintf(dir, sizeof(dir), "C:\\ProgramData");
	snprintf(pattern, sizeof(pattern), "%s\\luna-de\\novacom-*.sock", dir);
	h = FindFirstFileA(pattern, &fd);
	if (h == INVALID_HANDLE_VALUE) return;
	do {
		if (!is_socket_name(fd.cFileName)) continue;
		snprintf(path, sizeof(path), "%s\\luna-de\\%s", dir, fd.cFileName);
		found(path);
	} while (FindNextFileA(h, &fd));
	FindClose(h);
}

#else

/* The sockets in one copy's folder, if the folder is uid's own and closed to everyone else. */
static void search_folder(const char *dir, unsigned long uid)
{
	char path[PATH_MAX_LEN];
	struct stat st;
	DIR *d;
	struct dirent *s;
	if (lstat(dir, &st) != 0 || !S_ISDIR(st.st_mode) || st.st_uid != uid || (st.st_mode & 077)) return;
	if (!(d = opendir(dir))) return;
	while ((s = readdir(d))) {
		if (!is_socket_name(s->d_name)) continue;
		snprintf(path, sizeof(path), "%s/%s", dir, s->d_name);
		if (lstat(path, &st) != 0 || !S_ISSOCK(st.st_mode) || st.st_uid != uid) continue;
		found(path);
	}
	closedir(d);
}

/* Each entry of parent named <prefix><uid>, as folder (with suffix) to search for that uid. */
static void search_under(const char *parent, const char *prefix, const char *suffix)
{
	DIR *p = opendir(parent);
	struct dirent *e;
	size_t n = strlen(prefix);
	if (!p) return;
	while ((e = readdir(p))) {
		char dir[PATH_MAX_LEN], *end;
		unsigned long uid;
		if (strncmp(e->d_name, prefix, n) != 0) continue;
		uid = strtoul(e->d_name + n, &end, 10);
		if (end == e->d_name + n || *end) continue;
		snprintf(dir, sizeof(dir), "%s/%s%s", parent, e->d_name, suffix);
		search_folder(dir, uid);
	}
	closedir(p);
}

static void search(void)
{
	/* The user's runtime folder (Linux, $XDG_RUNTIME_DIR): systemd's PrivateTmp, which the
	 * service novacomd runs as here has, hides the real /tmp from it. */
	search_under("/run/user", "", "/luna-de");
	/* /tmp, where there is no runtime folder (macOS). */
	search_under("/tmp", "luna-de-", "");
}

#endif

static void *search_thread(void *arg)
{
	for (;;) {
		relay_t *r, **pp;

		pthread_mutex_lock(&relays_mutex);
		for (r = relays; r; r = r->next) r->seen = 0;
		pthread_mutex_unlock(&relays_mutex);

		search();

		/* Copies that have quit, or stopped answering. */
		pthread_mutex_lock(&relays_mutex);
		for (pp = &relays; (r = *pp); ) {
			if (!r->seen) {
				TRACEL(LOG_ALWAYS, "dev '%s' via %s gone (%s)\n", r->nduid, LOCAL_CONNTYPE, r->path);
				*pp = r->next;
				r->closing = 1;      /* its accept thread closes and frees it */
			} else {
				pp = &r->next;
			}
		}
		pthread_mutex_unlock(&relays_mutex);

		sleep(POLL_SECONDS);
	}
	return NULL;
}

void local_relay_start(void)
{
	pthread_t t;
	if (!g_local_relay) return;
	if (pthread_create(&t, NULL, search_thread, NULL) == 0)
		pthread_detach(t);
}

void local_relay_dump(SOCKET socket)
{
	relay_t *r;
	char buf[256];
	pthread_mutex_lock(&relays_mutex);
	for (r = relays; r; r = r->next) {
		snprintf(buf, sizeof(buf), "%d %s %s %s\n", r->port, r->nduid, LOCAL_CONNTYPE, LOCAL_DEVTYPE);
		send(socket, buf, strlen(buf), 0);
	}
	pthread_mutex_unlock(&relays_mutex);
}
