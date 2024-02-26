# Variables:
VAR="value" # Set a variable
echo $VAR # Use a variable

# Arrays:
ARRAY=("item1" "item2" "item3") # Define an array
echo ${ARRAY[0]} # Access an array element
echo ${ARRAY[*]} # Access all array elements

# Loops:
for i in {1..5}; do echo $i; done # For loop
while [ $i -lt 5 ]; do echo $i; ((i++)); done # While loop

# Conditional statements:
if [ $i -eq 5 ]; then echo "Equal"; fi # If statement
case $i in 1) echo "One";; 2) echo "Two";; esac # Case statement

# Functions:
function name() { echo "Hello, $1"; } # Define a function
name "World" # Call a function

# File operations:
cat file # Print file content
less file # View file content page by page
cp source destination # Copy a file
mv source destination # Move a file
rm file # Remove a file

# Directory operations:
ls # List directory content
cd directory # Change directory
mkdir directory # Make a directory
rmdir directory # Remove a directory

# Process management:
ps # List processes
top # Monitor system, processes and resource usage
kill pid # Kill a process

# Networking:
ping host # Send ICMP ECHO_REQUEST to network hosts
netstat # Network statistics
ssh user@host # Remote login with SSH

# Permissions:
chmod 755 file # Change file permissions
chown user:group file # Change file owner and group

# Archives:
tar cf archive.tar files # Create a tar archive
tar xf archive.tar # Extract a tar archive
gzip file # Compress a file with Gzip
gunzip file.gz # Decompress a Gzip file

# Searching:
grep pattern files # Search for a pattern in files
find /dir -name pattern # Find files in /dir with name matching pattern
