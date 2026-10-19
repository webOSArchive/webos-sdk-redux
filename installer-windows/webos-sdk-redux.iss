; webOS SDK Redux - Windows GUI installer (Inno Setup 6.3 or later)
;
; Build it with build.ps1 beside this file, which passes the defines below. It installs what
; install-windows.bat does - the SDK with its Current junction, the PDK, HP's USB driver MSI and
; this repo's novacomd as the NovacomD service - behind a wizard, with an entry in Apps &
; Features whose uninstaller hands the service back to HP's novacomd. See WINDOWS.md.

#ifndef AppVersion
  #error Build with build.ps1: AppVersion is not defined
#endif
#ifndef RepoRoot
  #error Build with build.ps1: RepoRoot is not defined
#endif
#ifndef NovacomdExe
  #define NovacomdExe RepoRoot + "\windows\novacomd.exe"
#endif
#ifndef RepoUrl
  #define RepoUrl "https://github.com/webOSArchive/webos-sdk-redux"
#endif

#define SdkSrc RepoRoot + "\" + AppVersion

[Setup]
AppId={{266107E2-F5EC-4628-AFB7-3B15998F2870}
AppName=webOS SDK Redux
AppVersion={#AppVersion}
AppVerName=webOS SDK Redux {#AppVersion}
AppPublisher=webOS SDK Redux contributors
AppPublisherURL={#RepoUrl}
AppSupportURL={#RepoUrl}/blob/main/WINDOWS.md
DefaultDirName={commonpf64}\PalmSDK
DefaultGroupName=webOS SDK Redux
DisableProgramGroupPage=yes
; an upgrade or reinstall goes where the last one went, without asking again
DisableDirPage=auto
UsePreviousAppDir=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
ChangesEnvironment=yes
WizardStyle=modern
Compression=lzma2/ultra64
SolidCompression=yes
OutputBaseFilename=webOS-SDK-Redux-{#AppVersion}-Setup
UninstallDisplayName=webOS SDK Redux {#AppVersion}
VersionInfoDescription=webOS SDK Redux {#AppVersion} Setup
VersionInfoProductName=webOS SDK Redux

[Types]
Name: "full";    Description: "Everything"
Name: "compact"; Description: "SDK tools, driver and novacomd only"
Name: "custom";  Description: "Choose components"; Flags: iscustom

[Components]
Name: "sdk";            Description: "SDK command-line tools (palm-*), frameworks and webos-tools.jar"; Types: full compact custom; Flags: fixed
Name: "samples";        Description: "Documentation, sample code and reference app sources (about 80 MB)"; Types: full
Name: "pdk";            Description: "PDK: headers and ARM device libraries, in C:\PalmPDK (no compiler)"; Types: full
Name: "driver";         Description: "Palm USB driver (HP's novacom MSI, binds devices to WinUSB)"; Types: full compact
Name: "novacomd";       Description: "Device daemon, run as the NovacomD service"; Types: full compact custom; Flags: fixed
Name: "novacomd\redux"; Description: "webOS SDK Redux novacomd: USB, TCP and Lunacy devices over adb"; Types: full compact custom; Flags: exclusive
Name: "novacomd\hp";    Description: "HP's 2011 novacomd: USB and TCP only, no Lunacy"; Flags: exclusive

[Files]
; The SDK, less the parts that are their own component and the macOS/Linux installers
Source: "{#SdkSrc}\*"; DestDir: "{app}\{#AppVersion}"; Components: sdk; Flags: recursesubdirs createallsubdirs ignoreversion; \
  Excludes: "\share\documentation,\share\samplecode,\share\applications,\install-sdk-*.sh,\uninstall-sdk-*.sh"
Source: "{#SdkSrc}\share\documentation\*"; DestDir: "{app}\{#AppVersion}\share\documentation"; Components: samples; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#SdkSrc}\share\samplecode\*";    DestDir: "{app}\{#AppVersion}\share\samplecode";    Components: samples; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#SdkSrc}\share\applications\*";  DestDir: "{app}\{#AppVersion}\share\applications";  Components: samples; Flags: recursesubdirs createallsubdirs ignoreversion
; The PDK's host-agnostic parts; pdk\bin is bash and stays out, as in install-windows.bat
Source: "{#RepoRoot}\pdk\include\*"; DestDir: "{sd}\PalmPDK\include"; Components: pdk; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#RepoRoot}\pdk\device\*";  DestDir: "{sd}\PalmPDK\device";  Components: pdk; Flags: recursesubdirs createallsubdirs ignoreversion
Source: "{#RepoRoot}\pdk\share\*";   DestDir: "{sd}\PalmPDK\share";   Components: pdk; Flags: recursesubdirs createallsubdirs ignoreversion
; HP's driver package, run by the code below
Source: "{#RepoRoot}\windows\NovacomInstaller_x64.msi"; DestDir: "{tmp}"; Components: driver; Flags: deleteafterinstall
; This repo's novacomd
Source: "{#NovacomdExe}"; DestDir: "{app}\novacomd"; DestName: "novacomd.exe"; Components: novacomd\redux; Flags: ignoreversion

[InstallDelete]
; what install-windows.bat copies that this setup leaves out, when it takes a batch install over
Type: files; Name: "{app}\{#AppVersion}\install-sdk-*.sh"
Type: files; Name: "{app}\{#AppVersion}\uninstall-sdk-*.sh"

[UninstallDelete]
Type: files; Name: "{app}\novacomd\hp-service.txt"

[Icons]
Name: "{group}\webOS SDK Command Prompt"; Filename: "{cmd}"; WorkingDir: "{%USERPROFILE}"; \
  Parameters: "/k ""title webOS SDK Redux && echo webOS SDK Redux {#AppVersion}. Try: novacom -l, palm-install --device-list, palm-help"""
Name: "{group}\SDK documentation"; Filename: "{app}\{#AppVersion}\share\documentation"; Components: samples
Name: "{group}\Windows notes (online)"; Filename: "{#RepoUrl}/blob/main/WINDOWS.md"
Name: "{group}\Uninstall webOS SDK Redux"; Filename: "{uninstallexe}"

[Run]
; Through Explorer, so the prompt gets the PATH this setup just changed rather than setup's own
Filename: "{win}\explorer.exe"; Parameters: """{group}\webOS SDK Command Prompt.lnk"""; \
  Description: "Open a webOS SDK command prompt"; Flags: postinstall nowait skipifsilent

[Code]
const
  ServiceName  = 'NovacomD';
  ServiceKey   = 'SYSTEM\CurrentControlSet\Services\NovacomD';
  EnvKey       = 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment';
  { Where HP's service registration is kept for the uninstaller: outside the install directory,
    so nothing that deletes that directory can lose it. }
  StateKey     = 'SOFTWARE\webOS SDK Redux';
  TemurinMsi   = 'https://api.adoptium.net/v3/installer/latest/21/ga/windows/x64/jre/hotspot/normal/eclipse';
  TemurinPage  = 'https://adoptium.net/temurin/releases/?os=windows&arch=x64&package=jre';
  ThisVersion  = '{#AppVersion}';
  { This setup's own Apps & Features entry: AppId + _is1 }
  OurUninstallKey = 'Software\Microsoft\Windows\CurrentVersion\Uninstall\{266107E2-F5EC-4628-AFB7-3B15998F2870}_is1';
  UninstallRoot   = 'Software\Microsoft\Windows\CurrentVersion\Uninstall\';
  { HP's "Novacomd" driver MSI (windows\NovacomInstaller_*.msi) and HP's own webOS SDK 3.0.x }
  HpDriverProduct = '{BA9A297F-0198-4EE8-90CB-F5036C180E1D}';
  HpSdkProduct    = '{53A97E00-7252-4ED0-A1EB-9F9712FC0AC9}';

var
  JavaPage: TWizardPage;
  JavaInstallBox: TNewCheckBox;
  DownloadPage: TDownloadWizardPage;
  JavaVersion: String;
  JavaDownloaded: Boolean;
  Status: String;
  { what was here before this setup ran }
  PrevVersion, PrevDir: String;
  DriverInstalled, HpSdkInstalled: Boolean;

{ ---- helpers ---- }

function RunHidden(const Exe, Params: String): Integer;
var
  R: Integer;
begin
  if not Exec(Exe, Params, '', SW_HIDE, ewWaitUntilTerminated, R) then
    R := -1;
  Log(Format('ran %s %s -> %d', [Exe, Params, R]));
  Result := R;
end;

function Sc(const Params: String): Integer;
begin
  Result := RunHidden(ExpandConstant('{sys}\sc.exe'), Params);
end;

{ Output of a cmd.exe command line, stderr included }
function Capture(const CommandLine: String): String;
var
  R, I: Integer;
  O: TExecOutput;
begin
  Result := '';
  if ExecAndCaptureOutput(ExpandConstant('{cmd}'), '/c ' + CommandLine + ' 2>&1', '', SW_HIDE, ewWaitUntilTerminated, R, O) then
    for I := 0 to GetArrayLength(O.StdOut) - 1 do
      Result := Result + O.StdOut[I] + #13#10;
end;

procedure AddStatus(const Line: String);
begin
  Status := Status + Line + #13#10;
end;

{ ---- what is already installed ---- }

{ The next dot-separated number of V, removed from V; 0 once V is empty }
function NextVersionPart(var V: String): Integer;
var
  P: Integer;
begin
  P := Pos('.', V);
  if P = 0 then
    P := Length(V) + 1;
  Result := StrToIntDef(Copy(V, 1, P - 1), 0);
  Delete(V, 1, P);
end;

{ <0, 0 or >0 as A is older than, the same as or newer than B: '0.4' < '0.10' }
function CompareVersions(A, B: String): Integer;
var
  X, Y: Integer;
begin
  Result := 0;
  while (Result = 0) and ((A <> '') or (B <> '')) do begin
    X := NextVersionPart(A);
    Y := NextVersionPart(B);
    Result := X - Y;
  end;
end;

{ An MSI or other installer's Apps & Features entry, in either registry view }
function ProductInstalled(const Code: String): Boolean;
begin
  Result := RegKeyExists(HKLM64, UninstallRoot + Code) or RegKeyExists(HKLM32, UninstallRoot + Code);
end;

function SameDir(const A, B: String): Boolean;
begin
  Result := CompareText(RemoveBackslashUnlessRoot(A), RemoveBackslashUnlessRoot(B)) = 0;
end;

{ An SDK that install-windows.bat put in Dir: its folders, but no uninstaller of ours }
function BatchInstallIn(const Dir: String): Boolean;
begin
  Result := (DirExists(AddBackslash(Dir) + 'Current') or DirExists(AddBackslash(Dir) + ThisVersion)) and
            not FileExists(AddBackslash(Dir) + 'unins000.exe');
end;

function IsVersionName(const Name: String): Boolean;
var
  I: Integer;
begin
  Result := (Name <> '') and (Name[1] >= '0') and (Name[1] <= '9');
  for I := 1 to Length(Name) do
    if not (((Name[I] >= '0') and (Name[I] <= '9')) or (Name[I] = '.')) then
      Result := False;
end;

{ SDK version folders in Dir other than this one and the one being upgraded: left alone,
  as install-windows.bat leaves them (backups such as 0.3.backup.<date> are listed too) }
function OtherVersions(const Dir: String): String;
var
  F: TFindRec;
  Base: String;
begin
  Result := '';
  if FindFirst(AddBackslash(Dir) + '*', F) then
    try
      repeat
        if (F.Attributes and FILE_ATTRIBUTE_DIRECTORY <> 0) and (F.Name[1] >= '0') and (F.Name[1] <= '9') then begin
          Base := F.Name;
          if (Pos('.backup.', Base) > 0) or (IsVersionName(Base) and (Base <> ThisVersion) and (Base <> PrevVersion)) then begin
            if Result <> '' then
              Result := Result + ', ';
            Result := Result + F.Name;
          end;
        end;
      until not FindNext(F);
    finally
      FindClose(F);
    end;
end;


{ ---- Java ---- }

{ The version string `java -version` prints, or '' }
function FindJava: String;
var
  S, Home: String;
  P: Integer;
begin
  S := Capture('java -version');
  Home := GetEnv('JAVA_HOME');
  if (Pos('version "', S) = 0) and (Home <> '') and FileExists(AddBackslash(Home) + 'bin\java.exe') then
    S := Capture('"' + AddBackslash(Home) + 'bin\java.exe" -version');
  P := Pos('version "', S);
  if P = 0 then begin
    Result := '';
    exit;
  end;
  S := Copy(S, P + 9, 40);
  P := Pos('"', S);
  if P > 0 then
    S := Copy(S, 1, P - 1);
  Result := S;
end;

{ 8 for "1.8.0_402", 21 for "21.0.2", 0 for '' }
function JavaMajor(const Version: String): Integer;
var
  S: String;
  P: Integer;
begin
  S := Version;
  if Copy(S, 1, 2) = '1.' then
    S := Copy(S, 3, Length(S));
  P := 1;
  while (P <= Length(S)) and (S[P] >= '0') and (S[P] <= '9') do
    P := P + 1;
  Result := StrToIntDef(Copy(S, 1, P - 1), 0);
end;

function JavaOk: Boolean;
begin
  Result := JavaMajor(JavaVersion) >= 8;
end;

function WantJavaInstall: Boolean;
begin
  Result := (not JavaOk) and JavaInstallBox.Checked;
end;

procedure TemurinLinkClick(Sender: TObject);
var
  R: Integer;
begin
  ShellExec('open', TemurinPage, '', '', SW_SHOWNORMAL, ewNoWait, R);
end;

{ ---- PATH ---- }

{ The machine PATH without Dir, compared case-insensitively and with or without a trailing \ }
function PathWithout(const Path, Dir: String): String;
var
  Rest, Entry: String;
  P: Integer;
begin
  Result := '';
  Rest := Path;
  while Rest <> '' do begin
    P := Pos(';', Rest);
    if P = 0 then
      P := Length(Rest) + 1;
    Entry := Copy(Rest, 1, P - 1);
    Delete(Rest, 1, P);
    if (Entry <> '') and not SameDir(Entry, Dir) then begin
      if Result <> '' then
        Result := Result + ';';
      Result := Result + Entry;
    end;
  end;
end;

procedure RemoveFromPath(const Dir: String);
var
  P: String;
begin
  if RegQueryStringValue(HKLM, EnvKey, 'Path', P) then
    RegWriteExpandStringValue(HKLM, EnvKey, 'Path', PathWithout(P, Dir));
end;

{ First puts Dir at the front, moving it there if it is already on the PATH further down: the
  machine PATH comes before the user's, so this SDK's palm-* win over HP's original SDK's }
procedure AddToPath(const Dir: String; First: Boolean);
var
  P, Rest, Added: String;
begin
  if not RegQueryStringValue(HKLM, EnvKey, 'Path', P) then
    P := '';
  Rest := PathWithout(P, Dir);
  if First then begin
    if Rest <> '' then
      P := Dir + ';' + Rest
    else
      P := Dir;
  end else if Rest = PathWithout(P, '') then begin
    { not there yet }
    if Rest <> '' then
      P := Rest + ';' + Dir
    else
      P := Dir;
  end else
    { already on the PATH, put there by someone else: theirs to keep }
    exit;
  RegWriteExpandStringValue(HKLM, EnvKey, 'Path', P);
  { remembered, so the uninstaller takes off what this setup put on, and only that }
  if not RegQueryStringValue(HKLM, StateKey, 'AddedPaths', Added) then
    Added := '';
  if Pos(';' + Uppercase(Dir) + ';', ';' + Uppercase(Added)) = 0 then
    RegWriteStringValue(HKLM, StateKey, 'AddedPaths', Added + Dir + ';');
end;

{ ---- the NovacomD service ---- }

function ServiceImage: String;
begin
  if not RegQueryStringValue(HKLM, ServiceKey, 'ImagePath', Result) then
    Result := '';
end;

function ServiceDescription: String;
begin
  if not RegQueryStringValue(HKLM, ServiceKey, 'Description', Result) then
    Result := '';
end;

{ Whether the service runs this repo's novacomd, from this setup or from install-windows.bat }
function ServiceIsOurs: Boolean;
begin
  Result := (Pos('PALMSDK\NOVACOMD\', Uppercase(ServiceImage)) > 0) or
            (Pos('PalmSDK Redux novacomd', ServiceDescription) > 0);
end;

function ServiceRunning: Boolean;
begin
  Result := Pos('RUNNING', Capture('"' + ExpandConstant('{sys}\sc.exe') + '" query ' + ServiceName)) > 0;
end;

procedure StopService;
var
  I: Integer;
begin
  RunHidden(ExpandConstant('{sys}\net.exe'), 'stop ' + ServiceName);
  for I := 1 to 40 do begin
    if not ServiceRunning then
      break;
    Sleep(250);
  end;
end;

{ Records HP's registration while the service is still HP's. Picks up what install-windows.bat
  saved, when that installed our novacomd before this setup did. }
procedure SaveHpService;
var
  Image: String;
  Old: TArrayOfString;
begin
  Image := ServiceImage;
  if (Image <> '') and not ServiceIsOurs then begin
    RegWriteStringValue(HKLM, StateKey, 'HPServicePath', Image);
    RegWriteStringValue(HKLM, StateKey, 'HPServiceDescription', ServiceDescription);
  end else if not RegValueExists(HKLM, StateKey, 'HPServicePath') and
              LoadStringsFromFile(ExpandConstant('{app}\novacomd\hp-service.txt'), Old) and
              (GetArrayLength(Old) > 0) then begin
    RegWriteStringValue(HKLM, StateKey, 'HPServicePath', Old[0]);
    if GetArrayLength(Old) > 1 then
      RegWriteStringValue(HKLM, StateKey, 'HPServiceDescription', Old[1]);
  end;
end;

{ Points NovacomD back at HP's novacomd and starts it }
function RestoreHpService: Boolean;
var
  Path, Desc: String;
begin
  Result := False;
  if not RegQueryStringValue(HKLM, StateKey, 'HPServicePath', Path) then
    exit;
  if not RegQueryStringValue(HKLM, StateKey, 'HPServiceDescription', Desc) then
    Desc := '';
  StringChangeEx(Path, '"', '', True);
  if not FileExists(Path) then begin
    Log('HP novacomd not found at ' + Path);
    exit;
  end;
  StopService;
  if Sc('config ' + ServiceName + ' binPath= "' + Path + '"') <> 0 then
    exit;
  if Desc <> '' then
    Sc('description ' + ServiceName + ' "' + Desc + '"');
  RunHidden(ExpandConstant('{sys}\net.exe'), 'start ' + ServiceName);
  Result := ServiceRunning;
end;

{ What setup found and what it will do about it, for the Ready page and the log }
function InstallSummary(const Dir, NewLine, Space: String): String;
var
  Others, Image: String;
begin
  Result := '';
  if PrevVersion = '' then begin
    if BatchInstallIn(Dir) then
      Result := Result + Space + 'An SDK installed by install-windows.bat is in this folder. Setup takes it over, ' +
        'so from now on it uninstalls from Settings > Apps.' + NewLine
    else
      Result := Result + Space + 'New installation.' + NewLine;
  end else if not SameDir(PrevDir, Dir) then
    Result := Result + Space + 'webOS SDK Redux ' + PrevVersion + ' is installed in ' + PrevDir +
      '. This installs ' + ThisVersion + ' in ' + Dir + ' instead.' + NewLine
  else begin
    case CompareVersions(PrevVersion, ThisVersion) of
      0: Result := Result + Space + 'webOS SDK Redux ' + ThisVersion + ' is already installed: it is reinstalled ' +
           '(repaired) with the components chosen.' + NewLine;
    else
      if CompareVersions(PrevVersion, ThisVersion) < 0 then
        Result := Result + Space + 'Upgrade from webOS SDK Redux ' + PrevVersion + ': its SDK ' + PrevVersion +
          ' folder is replaced by ' + ThisVersion + '.' + NewLine
      else
        Result := Result + Space + 'Downgrade from webOS SDK Redux ' + PrevVersion + ' to ' + ThisVersion + '.' + NewLine;
    end;
  end;

  Others := OtherVersions(Dir);
  if Others <> '' then
    Result := Result + Space + 'Other SDK folders here are left as they are: ' + Others + '.' + NewLine;

  if WizardIsComponentSelected('driver') then begin
    if DriverInstalled then
      Result := Result + Space + 'Palm USB driver: already installed, left as it is.' + NewLine
    else
      Result := Result + Space + 'Palm USB driver: will be installed.' + NewLine;
  end;

  Image := ServiceImage;
  if Image = '' then
    Result := Result + Space + 'NovacomD service: not installed yet.' + NewLine
  else if ServiceIsOurs then
    Result := Result + Space + 'NovacomD service: runs this repo''s novacomd now.' + NewLine
  else
    Result := Result + Space + 'NovacomD service: runs HP''s novacomd now.' + NewLine;

  if HpSdkInstalled then
    Result := Result + Space + 'HP''s original webOS SDK is also installed. It is left alone; this SDK''s ' +
      'palm-* commands go first on the PATH, so they are the ones that run.' + NewLine;

  if JavaOk then
    Result := Result + Space + 'Java: ' + JavaVersion + ' found.' + NewLine
  else if WantJavaInstall then
    Result := Result + Space + 'Java: not found; the Eclipse Temurin 21 JRE will be downloaded and installed.' + NewLine
  else
    Result := Result + Space + 'Java: not found, and not being installed. The palm-* tools need Java 8 or later.' + NewLine;
end;
{ ---- wizard ---- }

{ Before any page: what is installed already, and a newer version is not replaced unasked }
function InitializeSetup: Boolean;
begin
  Result := True;
  if not RegQueryStringValue(HKLM, OurUninstallKey, 'DisplayVersion', PrevVersion) then
    PrevVersion := '';
  if not RegQueryStringValue(HKLM, OurUninstallKey, 'InstallLocation', PrevDir) then
    PrevDir := '';
  DriverInstalled := ProductInstalled(HpDriverProduct);
  HpSdkInstalled := ProductInstalled(HpSdkProduct) or DirExists(ExpandConstant('{commonpf32}\HP webOS\SDK'));
  Log('found: previous version "' + PrevVersion + '" in "' + PrevDir + '", HP driver ' +
    IntToStr(Ord(DriverInstalled)) + ', HP SDK ' + IntToStr(Ord(HpSdkInstalled)));
  if (PrevVersion <> '') and (CompareVersions(PrevVersion, ThisVersion) > 0) then
    Result := SuppressibleMsgBox('webOS SDK Redux ' + PrevVersion + ' is installed, which is newer than the ' +
      ThisVersion + ' this setup installs.' + #13#10#13#10 + 'Replace it with the older version?',
      mbConfirmation, MB_YESNO or MB_DEFBUTTON2, IDNO) = IDYES;
end;

function UpdateReadyMemo(Space, NewLine, MemoUserInfoInfo, MemoDirInfo, MemoTypeInfo,
  MemoComponentsInfo, MemoGroupInfo, MemoTasksInfo: String): String;
begin
  Result := 'Found on this PC:' + NewLine + InstallSummary(WizardDirValue, NewLine, Space);
  if MemoDirInfo <> '' then
    Result := Result + NewLine + MemoDirInfo + NewLine;
  if MemoTypeInfo <> '' then
    Result := Result + NewLine + MemoTypeInfo + NewLine;
  if MemoComponentsInfo <> '' then
    Result := Result + NewLine + MemoComponentsInfo + NewLine;
end;

procedure InitializeWizard;
var
  Info, Link: TNewStaticText;
begin
  JavaVersion := FindJava;
  Log('Java: "' + JavaVersion + '"');

  JavaPage := CreateCustomPage(wpSelectComponents, 'Java', 'The palm-* tools need Java 8 or later.');
  Info := TNewStaticText.Create(JavaPage);
  Info.Parent := JavaPage.Surface;
  Info.Width := JavaPage.SurfaceWidth;
  Info.WordWrap := True;
  Info.Caption := 'No Java 8 or later was found on this PC. The SDK installs without it, but palm-install, ' +
    'palm-log and the other tools will not run until Java is installed.' + #13#10#13#10 +
    'Eclipse Temurin is the free, standard build of OpenJDK:';
  Link := TNewStaticText.Create(JavaPage);
  Link.Parent := JavaPage.Surface;
  Link.Top := Info.Top + Info.Height + ScaleY(6);
  Link.Caption := TemurinPage;
  Link.Cursor := crHand;
  Link.Font.Color := clBlue;
  Link.Font.Style := [fsUnderline];
  Link.OnClick := @TemurinLinkClick;
  JavaInstallBox := TNewCheckBox.Create(JavaPage);
  JavaInstallBox.Parent := JavaPage.Surface;
  JavaInstallBox.Top := Link.Top + Link.Height + ScaleY(18);
  JavaInstallBox.Width := JavaPage.SurfaceWidth;
  JavaInstallBox.Caption := 'Download and install the Eclipse Temurin 21 JRE now (about 35 MB)';
  JavaInstallBox.Checked := True;

  DownloadPage := CreateDownloadPage(SetupMessage(msgWizardPreparing), SetupMessage(msgPreparingDesc), nil);
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := (PageID = JavaPage.ID) and JavaOk;
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  if (CurPageID = wpSelectComponents) and WizardIsComponentSelected('novacomd\hp') and
     not WizardIsComponentSelected('driver') and (ServiceImage = '') then
    SuppressibleMsgBox('HP''s novacomd comes with the USB driver package, which is not installed here and ' +
      'is not selected. Without it nothing will serve the SDK tools.', mbInformation, MB_OK, IDOK);
  if (CurPageID = wpReady) and WantJavaInstall then begin
    DownloadPage.Clear;
    DownloadPage.Add(TemurinMsi, 'temurin-jre.msi', '');
    DownloadPage.Show;
    try
      try
        DownloadPage.Download;
        JavaDownloaded := True;
      except
        if not DownloadPage.AbortedByUser then
          SuppressibleMsgBox('The Java runtime could not be downloaded:' + #13#10 + GetExceptionMessage + #13#10#13#10 +
            'Setup will carry on without it. Install Java 8 or later yourself from ' + TemurinPage,
            mbError, MB_OK, IDOK);
      end;
    finally
      DownloadPage.Hide;
    end;
  end;
end;

{ ---- install ---- }

procedure CurStepChanged(CurStep: TSetupStep);
var
  R: Integer;
  Msi: String;
begin
  if CurStep = ssInstall then begin
    { the Ready page's summary, also for silent installs, which have no Ready page }
    Log('Found on this PC:' + #13#10 + InstallSummary(WizardDirValue, #13#10, '  '));
    { a running service holds novacomd.exe open }
    if ServiceImage <> '' then
      StopService;
  end;

  if CurStep = ssPostInstall then begin
    { Current -> <version>, a junction: needs no developer mode, unlike a symlink }
    RunHidden(ExpandConstant('{cmd}'), '/c rmdir "' + ExpandConstant('{app}\Current') + '"');
    R := RunHidden(ExpandConstant('{cmd}'), '/c mklink /J "' + ExpandConstant('{app}\Current') + '" "' +
      ExpandConstant('{app}\{#AppVersion}') + '"');
    if R <> 0 then
      AddStatus('Warning: could not create the Current junction (' + IntToStr(R) + ').');

    { an upgrade: the version this setup installed last time goes, now Current points past it.
      Folders setup didn't install (install-windows.bat's older versions, backups) stay. }
    if IsVersionName(PrevVersion) and (CompareText(PrevVersion, ThisVersion) <> 0) and
       SameDir(PrevDir, ExpandConstant('{app}')) and DirExists(ExpandConstant('{app}\') + PrevVersion) then begin
      if DelTree(ExpandConstant('{app}\') + PrevVersion, True, True, True) then
        AddStatus('Upgraded from ' + PrevVersion + ': its SDK folder was removed.')
      else
        AddStatus('Upgraded from ' + PrevVersion + ', but its SDK folder could not be removed; delete it yourself.');
    end else if CompareText(PrevVersion, ThisVersion) = 0 then
      AddStatus('Reinstalled ' + ThisVersion + '.');

    AddToPath(ExpandConstant('{app}\Current\bin'), True);

    if WizardIsComponentSelected('driver') and DriverInstalled then
      AddStatus('USB driver: already installed, left as it is.')
    else if WizardIsComponentSelected('driver') then begin
      WizardForm.StatusLabel.Caption := 'Installing the Palm USB driver...';
      Msi := ExpandConstant('{tmp}\NovacomInstaller_x64.msi');
      R := RunHidden(ExpandConstant('{sys}\msiexec.exe'), '/i "' + Msi + '" /passive /norestart');
      if (R = 0) or (R = 3010) then
        AddStatus('USB driver: installed.')
      else
        AddStatus('USB driver: the MSI reported error ' + IntToStr(R) + '; see WINDOWS.md.');
    end;
    { HP's MSI puts novacom.exe there; with it on PATH, `novacom -l` works from any prompt }
    if FileExists(ExpandConstant('{commonpf64}\Palm, Inc\novacom.exe')) then
      AddToPath(ExpandConstant('{commonpf64}\Palm, Inc'), False);

    if JavaDownloaded then begin
      WizardForm.StatusLabel.Caption := 'Installing the Eclipse Temurin JRE...';
      R := RunHidden(ExpandConstant('{sys}\msiexec.exe'), '/i "' + ExpandConstant('{tmp}\temurin-jre.msi') +
        '" ADDLOCAL=FeatureMain,FeatureEnvironment,FeatureJavaHome /passive /norestart');
      if (R = 0) or (R = 3010) then
        AddStatus('Java: Eclipse Temurin 21 JRE installed.')
      else
        AddStatus('Java: the Temurin installer reported error ' + IntToStr(R) + '. Install Java 8 or later from adoptium.net.');
    end else if JavaOk then
      AddStatus('Java: ' + JavaVersion + ' found.')
    else
      AddStatus('Java: not installed. The palm-* tools need Java 8 or later (adoptium.net).');

    WizardForm.StatusLabel.Caption := 'Setting up the NovacomD service...';
    SaveHpService;
    { install-windows.bat's record of it, now in the registry }
    DeleteFile(ExpandConstant('{app}\novacomd\hp-service.txt'));
    if WizardIsComponentSelected('novacomd\redux') then begin
      R := RunHidden(ExpandConstant('{app}\novacomd\novacomd.exe'), '-i');
      if (R = 0) and ServiceRunning then
        AddStatus('Device daemon: webOS SDK Redux novacomd, running as the NovacomD service.')
      else
        AddStatus('Device daemon: novacomd -i failed (' + IntToStr(R) + '). Run it again as Administrator to see why.');
    end else begin
      if ServiceIsOurs then
        RestoreHpService
      else
        RunHidden(ExpandConstant('{sys}\net.exe'), 'start ' + ServiceName);
      if ServiceRunning then
        AddStatus('Device daemon: HP''s novacomd, running as the NovacomD service.')
      else
        AddStatus('Device daemon: the NovacomD service is not running.');
    end;
  end;
end;

procedure CurPageChanged(CurPageID: Integer);
var
  I: Integer;
  C: String;
begin
  if (CurPageID = wpSelectComponents) and DriverInstalled then
    for I := 0 to WizardForm.ComponentsList.Items.Count - 1 do begin
      C := WizardForm.ComponentsList.ItemCaption[I];
      if (Pos('Palm USB driver', C) = 1) and (Pos('already installed', C) = 0) then
        WizardForm.ComponentsList.ItemCaption[I] := C + ' - already installed';
    end;
  if (CurPageID = wpFinished) and (Status <> '') then
    WizardForm.FinishedLabel.Caption := WizardForm.FinishedLabel.Caption + #13#10#13#10 + Status;
end;

{ ---- uninstall ---- }

{ Removes Dir and the folders under it that hold no files. The uninstaller removes only folders
  setup created, so after a batch install was taken over its folder tree would stay, empty. }
function RemoveEmptyDirs(const Dir: String): Boolean;
var
  F: TFindRec;
begin
  if FindFirst(AddBackslash(Dir) + '*', F) then
    try
      repeat
        if (F.Attributes and FILE_ATTRIBUTE_DIRECTORY <> 0) and (F.Name <> '.') and (F.Name <> '..') then
          RemoveEmptyDirs(AddBackslash(Dir) + F.Name);
      until not FindNext(F);
    finally
      FindClose(F);
    end;
  Result := RemoveDir(Dir);
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  Added, Dir: String;
  P: Integer;
begin
  if CurUninstallStep = usPostUninstall then begin
    RemoveEmptyDirs(ExpandConstant('{app}\{#AppVersion}'));
    RemoveEmptyDirs(ExpandConstant('{app}\novacomd'));
    RemoveDir(ExpandConstant('{app}'));
  end;

  if CurUninstallStep = usUninstall then begin
    { let go of the service before novacomd.exe is deleted }
    if ServiceIsOurs then begin
      if not RestoreHpService then begin
        StopService;
        RunHidden(ExpandConstant('{app}\novacomd\novacomd.exe'), '-u');
      end;
    end;

    RunHidden(ExpandConstant('{cmd}'), '/c rmdir "' + ExpandConstant('{app}\Current') + '"');

    if RegQueryStringValue(HKLM, StateKey, 'AddedPaths', Added) then
      while Added <> '' do begin
        P := Pos(';', Added);
        if P = 0 then
          P := Length(Added) + 1;
        Dir := Copy(Added, 1, P - 1);
        Delete(Added, 1, P);
        if Dir <> '' then
          RemoveFromPath(Dir);
      end;

    RegDeleteKeyIncludingSubkeys(HKLM, StateKey);
  end;
end;
