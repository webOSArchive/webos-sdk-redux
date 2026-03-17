#/* @@@LICENSE
#*
#*      Copyright (c) 2008-2012 Hewlett-Packard Development Company, L.P.
#*
#* Licensed under the Apache License, Version 2.0 (the "License");
#* you may not use this file except in compliance with the License.
#* You may obtain a copy of the License at
#*
#* http://www.apache.org/licenses/LICENSE-2.0
#*
#* Unless required by applicable law or agreed to in writing, software
#* distributed under the License is distributed on an "AS IS" BASIS,
#* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#* See the License for the specific language governing permissions and
#* limitations under the License.
#*
#* LICENSE@@@ */

# Disable all built-in implicit rules and suffix rules
MAKEFLAGS += --no-builtin-rules
.SUFFIXES:

TARGET := novacomd
BUILDDIR = build-$(TARGET)


# pull in the build version from OE if it's set
ifneq ($(BUILDVERSION),)
BUILDVERSION := \"$(TARGET)-$(BUILDVERSION)\"
else
BUILDVERSION ?= \"..local..$(shell whoami)@$(shell hostname)..$(shell date +%Y%m%d..%H:%M:%S)\"
endif

# overriding build version if it is building off of phoenix
ifneq ($(NC_SUBMISSION_NUMBER),)
BUILDVERSION := \"novacomd-$(NC_SUBMISSION_NUMBER)\"
endif


# Detect build architecture
UNAME := $(shell uname -s)
ARCH := $(shell uname -m)

# Allow architecture override for universal builds
BUILD_ARCH ?= $(ARCH)

# compiler flags, default libs to link against
MYCFLAGS := -Wall -W -Wno-multichar -Wno-unused-parameter -Wno-unused-function -Wno-unused-but-set-variable -g -O2 -Iinclude -DBUILDVERSION=$(BUILDVERSION)
CFLAGS :=

# pull in the machine build name version from OE if it's set
ifneq ($(MACHINE),)
MYCFLAGS += -DMACHINE=\"$(MACHINE)\"
endif

HOSTCFLAGS := $(MYCFLAGS) $(CFLAGS) -Isrc -DPLATFORM_PTHREADS=1
DEVICECFLAGS := $(MYCFLAGS) $(OECFLAGS) $(TARGET_CC_ARCH) -DPLATFORM_PTHREADS=1
CPPFLAGS := -g
ASMFLAGS :=
LDFLAGS :=
ENVP:=

HOSTLDLIBS :=
DEVICELDLIBS := -lpthread -lrt

# this may be overridden by OE, though it's likely to be the same
ifneq ($(TARGET_PREFIX),)
DEVICECC := $(TARGET_PREFIX)gcc
DEVICELD := $(TARGET_PREFIX)ld
else
DEVICECC := arm-none-linux-gnueabi-gcc
DEVICELD := arm-none-linux-gnueabi-ld
endif


# Platform-specific configuration
ifeq ($(UNAME), Darwin)
	# macOS-specific settings
	HOSTPLATFORM := pthreads
	HOSTOS := linux  # Use linux USB implementation which works via libusb
	HOSTLDLIBS += -lpthread -lusb

	# Detect Homebrew installation path (different for Intel vs Apple Silicon)
	HOMEBREW_PREFIX := $(shell brew --prefix 2>/dev/null || echo /usr/local)
	LIBUSB_PREFIX := $(shell brew --prefix libusb-compat 2>/dev/null || echo $(HOMEBREW_PREFIX)/opt/libusb-compat)

	# Add Homebrew paths for libusb-compat
	HOSTCFLAGS += -I$(LIBUSB_PREFIX)/include
	LDFLAGS += -L$(LIBUSB_PREFIX)/lib

	# Support for universal binaries (Intel + Apple Silicon)
	ifdef UNIVERSAL
		ARCH_FLAGS := -arch x86_64 -arch arm64
		HOSTCFLAGS += $(ARCH_FLAGS)
		LDFLAGS += $(ARCH_FLAGS)
	else ifdef BUILD_ARCH
		ARCH_FLAGS := -arch $(BUILD_ARCH)
		HOSTCFLAGS += $(ARCH_FLAGS)
		LDFLAGS += $(ARCH_FLAGS)
	endif

	# Use rpath to find libraries relative to executable
	LDFLAGS += -Wl,-rpath,@executable_path -Wl,-rpath,$(LIBUSB_PREFIX)/lib
else ifeq ($(UNAME), Linux)
	# Linux-specific settings
	HOSTPLATFORM := pthreads
	HOSTOS := linux
	HOSTLDLIBS += -lpthread -lusb
	LDFLAGS += -Wl,-rpath,.
	DEVICELDLIBS += -lrt
endif

COMMONOBJS := \
	src/main.o \
	src/log.o \
	src/socket.o \
	src/transport.o \
	src/transport_inet.o \
	src/transport_usb.o \
\
	src/novacom/lib.o \
	src/novacom/mux.o \
	src/novacom/packet.o \
	src/novacom/buf_queue.o \
	src/novacom/commands.o \
	src/novacom/commands_device.o \
\
	src/lib/cksum/adler32.o \
	src/lib/cksum/sha1.o \
	src/lib/buffer.o

DEVICEOBJS := \
	$(COMMONOBJS) \
	src/platform_pthreads.o \
	src/device/usb-gadget.o \
	src/device/auth.o \
	src/device/commands_service.o

HOSTOBJS := \
	$(COMMONOBJS) \
	src/host/device_list.o \
	src/host/usb-linux.o \
	src/host/tokenstorage.o \
	src/host/commands_service.o \
	src/host/recovery.o

# do some work based on the host platform
ifeq ($(HOSTPLATFORM), pthreads)
HOSTOBJS += \
	src/platform_pthreads.o
HOSTCFLAGS += -DPLATFORM_PTHREADS=1
endif

HOSTOBJS := $(addprefix $(BUILDDIR)/,$(HOSTOBJS))
DEVICEOBJS := $(addprefix $(BUILDDIR)-device/,$(DEVICEOBJS))

DEPS := $(OBJS:.o=.d) $(HOSTOBJS:.o=.d) $(DEVICEOBJS:.o=.d)

.PHONY: device host all universal help info

# Default target
all: host device

# Build targets
device: $(BUILDDIR)-device/$(TARGET)

host: $(BUILDDIR)/$(TARGET)

# Universal binary (macOS only - Intel + Apple Silicon)
universal:
	@echo "Building universal binary for macOS (x86_64 + arm64)..."
	$(MAKE) clean
	$(MAKE) host UNIVERSAL=1

# Show build information
info:
	@echo "Build Configuration:"
	@echo "  Platform: $(UNAME)"
	@echo "  Architecture: $(ARCH)"
	@echo "  Build Target: $(BUILD_ARCH)"
ifeq ($(UNAME), Darwin)
	@echo "  Homebrew Prefix: $(HOMEBREW_PREFIX)"
	@echo "  libusb-compat: $(LIBUSB_PREFIX)"
endif
	@echo "  Compiler: $(CC)"
	@echo "  CFLAGS: $(HOSTCFLAGS)"
	@echo "  LDFLAGS: $(LDFLAGS)"
	@echo "  LDLIBS: $(HOSTLDLIBS)"

# Help target
help:
	@echo "novacomd Makefile"
	@echo ""
	@echo "Targets:"
	@echo "  make host        - Build host version (for desktop/laptop)"
	@echo "  make device      - Build device version (for webOS device, requires ARM toolchain)"
	@echo "  make all         - Build both host and device versions"
	@echo "  make universal   - Build universal binary (macOS: x86_64 + arm64)"
	@echo "  make clean       - Remove build artifacts"
	@echo "  make spotless    - Remove all build directories"
	@echo "  make info        - Show build configuration"
	@echo "  make install     - Install host binary to PREFIX (default: /opt/nova)"
	@echo ""
	@echo "Variables:"
	@echo "  PREFIX=/path     - Installation prefix (default: /opt/nova)"
	@echo "  BUILD_ARCH=arch  - Build for specific architecture (x86_64, arm64, etc.)"
	@echo "  UNIVERSAL=1      - Build universal binary (macOS only)"

$(BUILDDIR)/$(TARGET): $(HOSTOBJS)
	@echo HOST linking $@
	@${ENVP} $(CC) $(LDFLAGS) $(HOSTOBJS) -o $@ $(HOSTLDLIBS)

$(BUILDDIR)-device/$(TARGET): $(DEVICEOBJS)
	@echo DEV linking $@
	@$(DEVICECC) $(LDFLAGS) $(DEVICEOBJS) -o $@ $(DEVICELDLIBS)

.PHONY: clean
clean:
	rm -f $(HOSTOBJS) $(DEVICEOBJS) $(DEPS) $(BUILDDIR)/$(TARGET) $(BUILDDIR)-device/$(TARGET)

.PHONY: spotless
spotless:
	rm -rf build-*

# Installation
PREFIX ?= /opt/nova
BINDIR = $(PREFIX)/bin

.PHONY: install
install: host
	@echo "Installing novacomd to $(BINDIR)..."
	@mkdir -p $(BINDIR)
	install -m 755 $(BUILDDIR)/$(TARGET) $(BINDIR)/$(TARGET)
	@echo "Installation complete!"
	@echo "Note: You may need to run 'sudo make install' for system-wide installation."

.PHONY: uninstall
uninstall:
	@echo "Removing novacomd from $(BINDIR)..."
	rm -f $(BINDIR)/$(TARGET)
	@echo "Uninstallation complete!"

# makes sure the target dir exists
MKDIR = if [ ! -d $(dir $@) ]; then mkdir -p $(dir $@); fi

$(BUILDDIR)/%.o: %.c
	@$(MKDIR)
	@echo HOST compiling $<
	@${ENVP} $(CC) -DHOST=1 $(HOSTCFLAGS) -c $< -MD -MT $@ -MF $(@:%o=%d) -o $@

$(BUILDDIR)/%.o: %.cpp
	@$(MKDIR)
	@echo HOST compiling $<
	@${ENVP} $(CC) -DHOST=1 $(HOSTCPPFLAGS) -c $< -MD -MT $@ -MF $(@:%o=%d) -o $@

$(BUILDDIR)/%.o: %.S
	@$(MKDIR)
	@echo HOST compiling $<
	@${ENVP} $(CC) -DHOST=1 $(HOSTASMFLAGS) -c $< -MD -MT $@ -MF $(@:%o=%d) -o $@

$(BUILDDIR)-device/%.o: %.c
	@$(MKDIR)
	@echo DEV compiling $<
	@$(DEVICECC) -DDEVICE=1 $(DEVICECFLAGS) -c $< -MD -MT $@ -MF $(@:%o=%d) -o $@

$(BUILDDIR)-device/%.o: %.cpp
	@$(MKDIR)
	@echo DEV compiling $<
	@$(DEVICECC) -DDEVICE=1 $(DEVICECPPFLAGS) -c $< -MD -MT $@ -MF $(@:%o=%d) -o $@

$(BUILDDIR)-device/%.o: %.S
	@$(MKDIR)
	@echo DEV compiling $<
	@$(DEVICECC) -DDEVICE=1 $(DEVICEASMFLAGS) -c $< -MD -MT $@ -MF $(@:%o=%d) -o $@

ifeq ($(filter $(MAKECMDGOALS), clean), )
-include $(DEPS)
endif
