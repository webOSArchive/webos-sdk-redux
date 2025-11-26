Cross-Platform Compatibility Confirmed ✓

  How it works on different platforms:

  macOS:
  1. First checks for java in PATH
  2. If not found, tries /usr/libexec/java_home utility
  3. Uses whichever is found

  Linux:
  1. Checks for java in PATH
  2. If found, uses it directly
  3. If not found, shows error

  POSIX Compliance

  All commands and syntax used are POSIX-compliant:
  - command -v java (standard way to check for commands)
  - uname -s (platform detection)
  - sed with Basic Regular Expressions (BRE)
  - grep -i (case-insensitive search)
  - [ -lt ] (numeric comparison)

  Tested Version Formats

  Works with all Java version formats:
  - Java 8: 1.8.0_432 → major version: 8
  - Java 11: 11.0.2 → major version: 11
  - Java 17: 17.0.1 → major version: 17
  - Java 21+: All modern versions

  Linux Java Sources Supported

  The scripts work with Java installed via:
  - Package managers (apt, yum, dnf): sudo apt install openjdk-11-jdk
  - SDKMAN: sdk install java
  - Manual installation (as long as java is in PATH)
  - Update-alternatives system: update-alternatives --config java
