/* @@@LICENSE
*
*      Copyright (c) 2008-2012 Hewlett-Packard Development Company, L.P.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* LICENSE@@@ */

/*
 * Windows build only. include/win32 is on the include path ahead of the system headers,
 * and its <sys/socket.h>, <netinet/in.h>, <poll.h>, ... all land here, so the shared
 * sources keep their POSIX includes. What Winsock spells differently is either mapped
 * below or goes through platform.h's platform_socket_* calls.
 *
 * FD_SETSIZE, _WIN32_WINNT and WIN32_LEAN_AND_MEAN are set by the makefile, since they
 * must be in place before anything pulls in winsock2.h.
 */

#ifndef __NOVACOMD_WIN32_COMPAT_H
#define __NOVACOMD_WIN32_COMPAT_H

#include <winsock2.h>
#include <ws2tcpip.h>
#include <windows.h>

typedef unsigned int uint;

/* MinGW has the C11 Annex K spelling */
#define localtime_r(timep, result) (localtime_s((result), (timep)) == 0 ? (result) : NULL)

/* shutdown() */
#ifndef SHUT_RDWR
#define SHUT_RD   SD_RECEIVE
#define SHUT_WR   SD_SEND
#define SHUT_RDWR SD_BOTH
#endif

/* Winsock has no per-call flag; the log socket is made non-blocking instead. */
#ifndef MSG_DONTWAIT
#define MSG_DONTWAIT 0
#endif

/* <poll.h>: Winsock's struct pollfd and POLLIN/POLLOUT/... are the same shape. */
#define poll(fds, nfds, timeout) WSAPoll((fds), (nfds), (timeout))

#endif
