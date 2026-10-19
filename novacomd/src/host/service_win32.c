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

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "debug.h"
#include "log.h"
#include "platform.h"
#include "service_win32.h"

#define SERVICE_NAME         "NovacomD"
#define SERVICE_DISPLAY_NAME "Palm Novacom"
#define SERVICE_DESCRIPTION  "Connects the webOS SDK tools to webOS devices over USB, TCP and adb (PalmSDK Redux novacomd)."
#define STOP_WAIT_MS         10000

static SERVICE_STATUS_HANDLE status_handle;
static SERVICE_STATUS status;
static service_main_t service_main;
static int service_argc;
static char **service_argv;

static void report_status(DWORD state, DWORD exit_code)
{
	status.dwServiceType = SERVICE_WIN32_OWN_PROCESS;
	status.dwCurrentState = state;
	status.dwControlsAccepted = (state == SERVICE_RUNNING) ? (SERVICE_ACCEPT_STOP | SERVICE_ACCEPT_SHUTDOWN) : 0;
	status.dwWin32ExitCode = exit_code ? ERROR_SERVICE_SPECIFIC_ERROR : NO_ERROR;
	status.dwServiceSpecificExitCode = exit_code;
	status.dwWaitHint = (state == SERVICE_RUNNING || state == SERVICE_STOPPED) ? 0 : 3000;
	SetServiceStatus(status_handle, &status);
}

/* as the daemon on SIGTERM: nothing to flush, just go */
static DWORD WINAPI stop_thread(LPVOID arg)
{
	/* let the control handler's reply reach the SCM first */
	Sleep(100);
	report_status(SERVICE_STOPPED, 0);
	ExitProcess(0);
	return 0;
}

static DWORD WINAPI control_handler(DWORD control, DWORD type, LPVOID data, LPVOID context)
{
	HANDLE thread;

	switch (control) {
		case SERVICE_CONTROL_STOP:
		case SERVICE_CONTROL_SHUTDOWN:
			report_status(SERVICE_STOP_PENDING, 0);
			thread = CreateThread(NULL, 0, stop_thread, NULL, 0, NULL);
			if (thread)
				CloseHandle(thread);
			else
				ExitProcess(0);
			return NO_ERROR;
		case SERVICE_CONTROL_INTERROGATE:
			return NO_ERROR;
		default:
			return ERROR_CALL_NOT_IMPLEMENTED;
	}
}

static VOID WINAPI service_entry(DWORD argc, LPSTR *argv)
{
	int rc;

	status_handle = RegisterServiceCtrlHandlerExA(SERVICE_NAME, control_handler, NULL);
	if (!status_handle)
		return;

	/* no console to log to: the debugger stream (DebugView) gets syslog's share instead */
	log_unmask(LOG_OUTPUT_CONSOLE, LOG_ALWAYS | LOG_ERROR);
	report_status(SERVICE_RUNNING, 0);

	/* only returns if it failed to start, e.g. its ports were taken */
	rc = service_main(service_argc, service_argv);
	report_status(SERVICE_STOPPED, rc ? (DWORD)rc : 1);
}

int service_win32_dispatch(service_main_t main, int argc, char **argv)
{
	SERVICE_TABLE_ENTRYA table[] = {
		{ SERVICE_NAME, service_entry },
		{ NULL, NULL }
	};

	service_main = main;
	service_argc = argc;
	service_argv = argv;

	if (StartServiceCtrlDispatcherA(table))
		return 1;
	/* ERROR_FAILED_SERVICE_CONTROLLER_CONNECT: run from a console, not by the SCM */
	return 0;
}

static void print_error(const char *what)
{
	DWORD err = GetLastError();
	char msg[256];

	if (!FormatMessageA(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, NULL, err, 0, msg, sizeof(msg), NULL))
		snprintf(msg, sizeof(msg), "error %lu\n", err);
	TRACEL(LOG_ERROR, "%s: %s", what, msg);
}

/*
 * Asks a service to stop and waits until its process has gone: a service can report
 * STOPPED while its process still holds the novacom ports.
 */
static void stop_service(SC_HANDLE service)
{
	SERVICE_STATUS st;
	SERVICE_STATUS_PROCESS sp;
	DWORD needed;
	DWORD waited = 0;
	HANDLE process = NULL;

	if (QueryServiceStatusEx(service, SC_STATUS_PROCESS_INFO, (LPBYTE)&sp, sizeof(sp), &needed) && sp.dwProcessId)
		process = OpenProcess(SYNCHRONIZE, FALSE, sp.dwProcessId);

	if (ControlService(service, SERVICE_CONTROL_STOP, &st)) {
		while (QueryServiceStatus(service, &st) && st.dwCurrentState != SERVICE_STOPPED && waited < STOP_WAIT_MS) {
			Sleep(250);
			waited += 250;
		}
	}
	if (process) {
		WaitForSingleObject(process, STOP_WAIT_MS);
		CloseHandle(process);
	}
}

int service_win32_install(void)
{
	char exe[MAX_PATH];
	char path[MAX_PATH + 2];
	SC_HANDLE scm;
	SC_HANDLE service;
	SERVICE_DESCRIPTIONA desc;
	int rc = -1;

	if (!GetModuleFileNameA(NULL, exe, sizeof(exe))) {
		print_error("unable to find novacomd.exe");
		return -1;
	}
	snprintf(path, sizeof(path), "\"%s\"", exe);

	scm = OpenSCManagerA(NULL, NULL, SC_MANAGER_CREATE_SERVICE | SC_MANAGER_CONNECT);
	if (!scm) {
		print_error("unable to open the service manager (run as Administrator)");
		return -1;
	}

	service = CreateServiceA(scm, SERVICE_NAME, SERVICE_DISPLAY_NAME, SERVICE_ALL_ACCESS,
			SERVICE_WIN32_OWN_PROCESS, SERVICE_AUTO_START, SERVICE_ERROR_NORMAL,
			path, NULL, NULL, NULL, NULL, NULL);
	if (!service && GetLastError() == ERROR_SERVICE_EXISTS) {
		/* HP's, or an earlier one of ours: point it at this executable */
		service = OpenServiceA(scm, SERVICE_NAME, SERVICE_ALL_ACCESS);
		if (service) {
			stop_service(service);
			if (!ChangeServiceConfigA(service, SERVICE_WIN32_OWN_PROCESS, SERVICE_AUTO_START, SERVICE_ERROR_NORMAL,
					path, NULL, NULL, NULL, NULL, NULL, SERVICE_DISPLAY_NAME)) {
				print_error("unable to reconfigure the " SERVICE_NAME " service");
				goto out;
			}
		}
	}
	if (!service) {
		print_error("unable to create the " SERVICE_NAME " service");
		goto out;
	}

	desc.lpDescription = SERVICE_DESCRIPTION;
	ChangeServiceConfig2A(service, SERVICE_CONFIG_DESCRIPTION, &desc);

	if (!StartServiceA(service, 0, NULL) && GetLastError() != ERROR_SERVICE_ALREADY_RUNNING) {
		print_error("installed, but unable to start the " SERVICE_NAME " service");
		goto out;
	}

	TRACEL(LOG_ALWAYS, "installed and started the " SERVICE_NAME " service: %s\n", path);
	rc = 0;
out:
	if (service)
		CloseServiceHandle(service);
	CloseServiceHandle(scm);
	return rc;
}

int service_win32_uninstall(void)
{
	SC_HANDLE scm;
	SC_HANDLE service;
	int rc = -1;

	scm = OpenSCManagerA(NULL, NULL, SC_MANAGER_CONNECT);
	if (!scm) {
		print_error("unable to open the service manager (run as Administrator)");
		return -1;
	}

	service = OpenServiceA(scm, SERVICE_NAME, SERVICE_STOP | SERVICE_QUERY_STATUS | DELETE);
	if (!service) {
		print_error("unable to open the " SERVICE_NAME " service");
		goto out;
	}

	stop_service(service);
	if (!DeleteService(service)) {
		print_error("unable to remove the " SERVICE_NAME " service");
	} else {
		TRACEL(LOG_ALWAYS, "removed the " SERVICE_NAME " service\n");
		rc = 0;
	}
	CloseServiceHandle(service);
out:
	CloseServiceHandle(scm);
	return rc;
}
