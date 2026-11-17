#ifndef __LOCAL_RELAY_H
#define __LOCAL_RELAY_H

#include "platform.h"

/* Look for Luna DE on this machine (local_relay.c). On unless -L / --no-local. */
extern int g_local_relay;

void local_relay_start(void);
/* Appends the Luna DE copies to a device list, in dump_device_list's format. */
void local_relay_dump(SOCKET socket);

#endif
