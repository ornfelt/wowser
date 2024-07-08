#! /bin/bash

###
# Apply diff
###
# First lazily check if patch is already applied
navigation_file="./lib/server/pipeline/navigation.js"
if grep -q '^\s*static libraryPath = "./libNavigation";' "$navigation_file"; then
    echo "Patch is already applied to $navigation_file. Skipping patch application."
elif grep -q '^\s*static libraryPath = "./Navigation.dll";' "$navigation_file"; then
    echo "Patch is not applied to $navigation_file. Applying patch."
    git apply linux.diff
    echo "Patch applied using linux.diff."
else
    echo "Unexpected content in $navigation_file. Manual review required."
fi

###
# Fix wowser.json
###
DIRS=(
    "/mnt/new/wow/"
    "$HOME/Downloads/wow/"
    "/media/2024/wow/"
)

NEW_PATH=""
# Check each directory and set NEW_PATH to the first one that exists
for DIR in "${DIRS[@]}"; do
    if [ -d "$DIR" ]; then
        NEW_PATH="$DIR"
        break
    fi
done

# Check if a new path was found
if [ -z "$NEW_PATH" ]; then
    echo "No valid directory found."
    #exit 1
fi

if [ -n "$NEW_PATH" ]; then
  NEW_PATH="${NEW_PATH}Data"
fi

ESCAPED_NEW_PATH=$(echo "$NEW_PATH" | sed 's/\\/\\\\/g')

# Update the wowser.json file with the new path
sed -i "s|\"clientData\": \".*\"|\"clientData\": \"$ESCAPED_NEW_PATH\"|g" wowser.json

echo "Updated wowser.json with new clientData path: $NEW_PATH"

###
# Check for MySQL or MariaDB
###
mysql_installed=false
mariadb_installed=false

if command -v mysql > /dev/null 2>&1; then
  mysql_installed=true
  mysql_version=$(mysql --version)
  echo "MySQL is installed: $mysql_version"
fi

if command -v mariadb > /dev/null 2>&1; then
  mariadb_installed=true
  mariadb_version=$(mariadb --version)
  echo "MariaDB is installed: $mariadb_version"
fi

if ! $mysql_installed && ! $mariadb_installed; then
  echo "Neither MySQL nor MariaDB is installed."
fi

# Check if MariaDB version is below 11.3.2
if $mariadb_installed; then
  # Extract version number
  version=$(echo $mariadb_version | grep -oP '\d+\.\d+\.\d+')

  # Compare version
  if [ "$(printf '%s\n' "$version" "11.3.2" | sort -V | head -n1)" != "11.3.2" ]; then
    echo "MariaDB version is below 11.3.2"

    # Uncomment port code line in nodemanager.js
    sed -i "s|//port: '/var/run/mysqld/mysqld.sock',|port: '/var/run/mysqld/mysqld.sock',|g" ./lib/server/pipeline/nodemanager.js
    echo "Updated nodemanager.js to uncomment the port line"
  else
    echo "MariaDB version is 11.3.2 or above"
  fi
fi

###
# Check for libblp and libstorm
###
# Function to check for library installation and copy if necessary
check_and_copy_library() {
    local lib_name=$1
    local lib_path="/usr/local/lib/$lib_name.so"
    local dest_path="/usr/lib/$lib_name.so"

    # Check if the library is installed
    if ! ldconfig -p | grep -q $lib_name; then
        echo "$lib_name is not installed."

        # Check if the library exists in /usr/local/lib/
        if [ -f "$lib_path" ]; then
            echo "$lib_name found in /usr/local/lib/. Copying to /usr/lib/..."
            #sudo cp "$lib_path" "$dest_path"
            #echo "$lib_name copied to /usr/lib/."
        else
            echo "$lib_name not found in /usr/local/lib/."
        fi
    else
        echo "$lib_name is installed."
    fi
}

check_and_copy_library "libblp"
check_and_copy_library "libstorm"

