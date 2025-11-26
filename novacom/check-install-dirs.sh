#!/bin/bash
#
# Diagnostic script to check installation directory permissions
#

echo "Checking installation directories..."
echo ""

check_dir() {
    local dir=$1
    echo "Checking: $dir"

    if [ -d "$dir" ]; then
        echo "  ✓ Directory exists"

        if [ -w "$dir" ]; then
            echo "  ✓ Directory is writable (as current user)"
        else
            echo "  ✗ Directory is NOT writable (as current user)"
            echo "    Will need sudo to write here"
        fi

        # Check ownership
        ls -ld "$dir" | awk '{print "  Owner: " $3 ":" $4 "  Permissions: " $1}'
    else
        echo "  ✗ Directory does NOT exist"

        # Check parent directory
        parent=$(dirname "$dir")
        if [ -d "$parent" ]; then
            echo "  Parent directory exists: $parent"
            if [ -w "$parent" ]; then
                echo "  ✓ Parent is writable - can create $dir"
            else
                echo "  ✗ Parent is NOT writable - will need sudo"
            fi
        else
            echo "  ✗ Parent directory does NOT exist: $parent"
        fi
    fi
    echo ""
}

echo "=== Common Installation Directories ==="
echo ""
check_dir "/usr/local/bin"
check_dir "/usr/local"
check_dir "/opt/homebrew/bin"
check_dir "/opt/nova/bin"

echo "=== Looking for novacomd ==="
echo ""
for path in "/usr/local/bin" "/opt/homebrew/bin" "/opt/nova/bin" "/usr/bin"; do
    if [ -f "$path/novacomd" ]; then
        echo "✓ Found: $path/novacomd"
        ls -l "$path/novacomd"
    fi
done

echo ""
echo "=== System Information ==="
echo "User: $(whoami)"
echo "Groups: $(groups)"
echo "umask: $(umask)"
