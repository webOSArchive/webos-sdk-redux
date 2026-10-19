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

#ifndef __SERVICE_WIN32_H
#define __SERVICE_WIN32_H

/*
 * novacomd as a Windows service, in place of daemonizing. It registers under HP's
 * name, NovacomD ("Palm Novacom"), so it takes over from HP's 2011 novacomd.exe.
 */

typedef int (*service_main_t)(int argc, char **argv);

/*
 * If the service control manager started this process, runs main as the service and
 * returns 1 once it has stopped; returns 0 when started any other way.
 */
int service_win32_dispatch(service_main_t main, int argc, char **argv);

/* novacomd -i / -u: (re)register this executable as the service and start it, or remove it */
int service_win32_install(void);
int service_win32_uninstall(void);

#endif
