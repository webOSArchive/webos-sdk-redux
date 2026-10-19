/*
 * Windows build only: there is no syslog, so messages go to the debugger
 * (OutputDebugString, readable with Sysinternals DebugView) instead.
 */

#ifndef __NOVACOMD_WIN32_SYSLOG_H
#define __NOVACOMD_WIN32_SYSLOG_H

#include <stdarg.h>
#include <stdio.h>
#include "compat.h"

#define LOG_LOCAL7 (23<<3)
#define LOG_INFO   6

static inline void openlog(const char *ident, int option, int facility)
{
	(void)ident; (void)option; (void)facility;
}

static inline void syslog(int priority, const char *fmt, ...)
{
	char msg[512];
	va_list ap;

	(void)priority;
	va_start(ap, fmt);
	vsnprintf(msg, sizeof(msg), fmt, ap);
	va_end(ap);
	OutputDebugStringA(msg);
}

#endif
