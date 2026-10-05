/*
 * Lunacy devices, reached through adb.
 *
 * Lunacy (https://github.com/webOSArchive/Lunacy) runs legacy webOS apps on Android, and
 * serves novacomd's device side on an abstract socket on the Android device. This finds
 * every adb device whose Lunacy answers, and lists it beside the USB and TCP devices, so
 * novacom, novaterm and the palm-* tools reach it like any other webOS device:
 *
 *     $ novacom -l
 *     44079 c37f7a3418b2688e6d933844b48ba803061b4fac usb topaz-linux
 *     45121 9c41e2f0a1b3c5d7e9f00112233445566778899a adb lunacy
 *
 * Nothing is added to the novacom protocol. Each client connection made to a Lunacy device's
 * port is spliced, byte for byte, to a fresh stream that the adb server opens to the socket on
 * the device: the client's command line and its packets go to Lunacy, which answers as a
 * device's novacomd answers a channel. A device's nduid is read the way a client would read
 * it, with `get file:///proc/nduid`, so one device on both USB and Wi-Fi adb is listed once.
 *
 * The adb server is the one the user runs (127.0.0.1:5037, or ADB_SERVER_SOCKET /
 * ANDROID_ADB_SERVER_PORT). novacomd never starts one: with no adb server there are simply
 * no Lunacy devices. Turn the search off with -A (--no-adb).
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <poll.h>
#include <pthread.h>
#include <netdb.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <netinet/in.h>
#include <netinet/tcp.h>
#include <arpa/inet.h>

#include "debug.h"
#include "log.h"
#include "platform.h"
#include "novacom.h"
#include "../novacomd_p.h"
#include "adb_relay.h"

/* The abstract socket Lunacy listens on (org.webosarchive.lunacy.card.Novacom.SOCKET). */
#define LUNACY_SOCKET     "org.webosarchive.lunacy.novacomd"
#define LUNACY_CONNTYPE   "adb"
#define LUNACY_DEVTYPE    "lunacy"
#define POLL_SECONDS      3
#define IO_TIMEOUT_MS     3000
#define PACKET_MAGIC      0xdecafbad
#define SERIAL_MAX        128

int g_adb_relay = 1;

typedef struct relay {
	struct relay *next;
	char nduid[NOVACOM_NDUID_STRLEN];
	char serial[SERIAL_MAX];
	SOCKET listen;
	int port;
	volatile int closing;
	int seen;                  /* found by this pass of the search */
} relay_t;

static relay_t *relays;
static pthread_mutex_t relays_mutex = PTHREAD_MUTEX_INITIALIZER;

/* ---- the adb server ---- */

static int adb_connect_server(void)
{
	const char *host = "127.0.0.1";
	char hostbuf[256];
	const char *port = "5037";
	char portbuf[16];
	const char *env = getenv("ADB_SERVER_SOCKET");   /* tcp:host:port */
	struct addrinfo hints, *res = NULL;
	int fd = -1;

	if (env && strncmp(env, "tcp:", 4) == 0) {
		const char *colon = strrchr(env + 4, ':');
		if (colon && (size_t)(colon - (env + 4)) < sizeof(hostbuf)) {
			memcpy(hostbuf, env + 4, colon - (env + 4));
			hostbuf[colon - (env + 4)] = 0;
			if (hostbuf[0]) host = hostbuf;
			snprintf(portbuf, sizeof(portbuf), "%s", colon + 1);
			port = portbuf;
		}
	} else if ((env = getenv("ANDROID_ADB_SERVER_PORT")) && *env) {
		snprintf(portbuf, sizeof(portbuf), "%s", env);
		port = portbuf;
	}

	memset(&hints, 0, sizeof(hints));
	hints.ai_family = AF_UNSPEC;
	hints.ai_socktype = SOCK_STREAM;
	if (getaddrinfo(host, port, &hints, &res) != 0 || !res)
		return -1;
	fd = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
	if (fd >= 0 && connect(fd, res->ai_addr, res->ai_addrlen) != 0) {
		close(fd);
		fd = -1;
	}
	freeaddrinfo(res);
	return fd;
}

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
	struct timeval tv;
	tv.tv_sec = ms / 1000;
	tv.tv_usec = (ms % 1000) * 1000;
	setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
	setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));
}

/* One adb request: "%04x<request>", answered OKAY or FAIL<len><message>. */
static int adb_request(int fd, const char *request)
{
	char head[5], status[4];
	size_t len = strlen(request);
	if (len > 0xffff) return -1;
	snprintf(head, sizeof(head), "%04x", (unsigned)len);
	if (write_all(fd, head, 4) < 0 || write_all(fd, request, len) < 0)
		return -1;
	if (read_all(fd, status, 4) < 0)
		return -1;
	return memcmp(status, "OKAY", 4) == 0 ? 0 : -1;
}

/* A stream to Lunacy's socket on one device, or -1. */
static int adb_open_lunacy(const char *serial, int timeout_ms)
{
	char req[SERIAL_MAX + 32];
	int fd = adb_connect_server();
	if (fd < 0) return -1;
	if (timeout_ms) set_timeout(fd, timeout_ms);
	snprintf(req, sizeof(req), "host:transport:%s", serial);
	if (adb_request(fd, req) < 0 || adb_request(fd, "localabstract:" LUNACY_SOCKET) < 0) {
		close(fd);
		return -1;
	}
	return fd;
}

/* The serials of the adb devices that are ready, one per line in buf. */
static int adb_devices(char *buf, size_t size)
{
	char lenhex[5];
	unsigned len;
	int fd = adb_connect_server();
	if (fd < 0) return -1;
	set_timeout(fd, IO_TIMEOUT_MS);
	if (adb_request(fd, "host:devices") < 0 || read_all(fd, lenhex, 4) < 0) {
		close(fd);
		return -1;
	}
	lenhex[4] = 0;
	len = (unsigned)strtoul(lenhex, NULL, 16);
	if (len >= size) len = size - 1;
	if (len && read_all(fd, buf, len) < 0) {
		close(fd);
		return -1;
	}
	buf[len] = 0;
	close(fd);
	return 0;
}

/* ---- Lunacy ---- */

/* Reads one novacom reply line ("ok 0\n"). */
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

/* The device's nduid, read with `get file:///proc/nduid`, or -1 if Lunacy isn't answering. */
static int lunacy_nduid(const char *serial, char nduid[NOVACOM_NDUID_STRLEN])
{
	const char *cmd = "get file:///proc/nduid\n";
	char line[64], data[128];
	size_t got = 0;
	int fd = adb_open_lunacy(serial, IO_TIMEOUT_MS);
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
	close(fd);
	return rc;
}

/* ---- relaying ---- */

typedef struct splice_args {
	int client;
	char serial[SERIAL_MAX];
} splice_args_t;

/* Copies both ways between a client and Lunacy until either end closes. */
static void *splice_thread(void *arg)
{
	splice_args_t *a = arg;
	int device = adb_open_lunacy(a->serial, 0);
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
		close(device);
	} else {
		/* As a device's novacomd answers a command it can't start. */
		const char *reply = "device not responding\n";
		write_all(a->client, reply, strlen(reply) + 1);
	}
	close(a->client);
	platform_free(a);
	return NULL;
}

/* Accepts clients on one Lunacy device's port. Owns the relay; frees it once it is closing. */
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
			if (!a) { close(c); continue; }
			a->client = c;
			pthread_mutex_lock(&relays_mutex);
			snprintf(a->serial, sizeof(a->serial), "%s", r->serial);
			pthread_mutex_unlock(&relays_mutex);
			if (pthread_create(&t, NULL, splice_thread, a) == 0) {
				pthread_detach(t);
			} else {
				close(c);
				platform_free(a);
			}
		}
	}
	close(r->listen);
	platform_free(r);
	return NULL;
}

static void add_relay(const char *serial, const char *nduid)
{
	pthread_t t;
	relay_t *r = platform_calloc(sizeof(*r));
	if (!r) return;
	snprintf(r->serial, sizeof(r->serial), "%s", serial);
	snprintf(r->nduid, sizeof(r->nduid), "%s", nduid);
	r->listen = create_listen_socket(0, g_listen_all);
	if (r->listen == INVALID_SOCKET) {
		platform_free(r);
		return;
	}
	r->port = get_socket_port(r->listen);
	r->seen = 1;
	TRACEL(LOG_ALWAYS, "dev '%s' via %s type %s (adb %s)\n", nduid, LUNACY_CONNTYPE, LUNACY_DEVTYPE, serial);
	pthread_mutex_lock(&relays_mutex);
	r->next = relays;
	relays = r;
	pthread_mutex_unlock(&relays_mutex);
	if (pthread_create(&t, NULL, accept_thread, r) == 0) {
		pthread_detach(t);
	} else {
		/* Leave it listed but unreachable is worse than not listing it. */
		pthread_mutex_lock(&relays_mutex);
		relays = r->next;
		pthread_mutex_unlock(&relays_mutex);
		close(r->listen);
		platform_free(r);
	}
}

/* Whether a relay already serves this nduid; marks it seen. */
static int have_nduid(const char *nduid)
{
	relay_t *r;
	int found = 0;
	pthread_mutex_lock(&relays_mutex);
	for (r = relays; r; r = r->next) {
		if (strcasecmp(r->nduid, nduid) == 0) {
			r->seen = 1;
			found = 1;
			break;
		}
	}
	pthread_mutex_unlock(&relays_mutex);
	return found;
}

static void *search_thread(void *arg)
{
	static char list[16384];
	for (;;) {
		relay_t *r, **pp;
		char *line, *save = NULL;

		pthread_mutex_lock(&relays_mutex);
		for (r = relays; r; r = r->next) r->seen = 0;
		pthread_mutex_unlock(&relays_mutex);

		if (adb_devices(list, sizeof(list)) == 0) {
			for (line = strtok_r(list, "\n", &save); line; line = strtok_r(NULL, "\n", &save)) {
				char serial[SERIAL_MAX], state[32], nduid[NOVACOM_NDUID_STRLEN];
				if (sscanf(line, "%127s %31s", serial, state) != 2 || strcmp(state, "device") != 0)
					continue;
				if (lunacy_nduid(serial, nduid) < 0)
					continue;
				if (!have_nduid(nduid))
					add_relay(serial, nduid);
			}
		}

		/* Devices that have gone, or whose Lunacy has stopped answering. */
		pthread_mutex_lock(&relays_mutex);
		for (pp = &relays; (r = *pp); ) {
			if (!r->seen) {
				TRACEL(LOG_ALWAYS, "dev '%s' via %s gone (adb %s)\n", r->nduid, LUNACY_CONNTYPE, r->serial);
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

void adb_relay_start(void)
{
	pthread_t t;
	if (!g_adb_relay) return;
	if (pthread_create(&t, NULL, search_thread, NULL) == 0)
		pthread_detach(t);
}

void adb_relay_dump(SOCKET socket)
{
	relay_t *r;
	char buf[256];
	pthread_mutex_lock(&relays_mutex);
	for (r = relays; r; r = r->next) {
		snprintf(buf, sizeof(buf), "%d %s %s %s\n", r->port, r->nduid, LUNACY_CONNTYPE, LUNACY_DEVTYPE);
		send(socket, buf, strlen(buf), 0);
	}
	pthread_mutex_unlock(&relays_mutex);
}
