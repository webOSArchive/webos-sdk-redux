#ifndef __ADB_RELAY_H
#define __ADB_RELAY_H

#include "platform.h"

/* Search adb for Lunacy devices (adb_relay.c). On unless -A / --no-adb. */
extern int g_adb_relay;

void adb_relay_start(void);
/* Appends the Lunacy devices to a device list, in dump_device_list's format. */
void adb_relay_dump(SOCKET socket);

#endif
