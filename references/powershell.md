Get-command –module –verb –noun 		#gcm, *
Get-help –showwindow
Get-help about_modules
Write-host
Read-host

# Arrays:
$array = 1,2,3,4,5
$array = @(1,2,3,4,5)

# Hash Tables:
$hashTable = @{"Name" = "John"; "Age" = 30}

# Switch Statements:
switch ($x) {
    1 { "One" }
    2 { "Two" }
    default { "Other" }
}

# Try/Catch/Finally:
try {
    # Code that may throw an exception
}
catch {
    # Handle the exception
}
finally {
    # Cleanup code
}

# Working with Files and Directories:
Get-ChildItem -Path C:\ -Recurse # List all files and directories recursively
New-Item -Path C:\temp\newfile.txt -ItemType File # Create a new file
Remove-Item -Path C:\temp\newfile.txt # Delete a file

# Importing and Exporting CSV:
Import-Csv -Path .\users.csv
Export-Csv -Path .\users.csv -NoTypeInformation

# Working with JSON:
ConvertTo-Json -InputObject $object
ConvertFrom-Json -InputObject $jsonString

# Working with XML:
[xml]$xmlString = Get-Content -Path .\document.xml
$xmlString.Save(".\document.xml")

# Background Jobs:
Start-Job -ScriptBlock { Get-Process }
Receive-Job -Job $job

# Remoting:
Enter-PSSession -ComputerName Server01
Invoke-Command -ComputerName Server01 -ScriptBlock { Get-Process }

# Modules:
Import-Module -Name ModuleName
Remove-Module -Name ModuleName

# Error Handling:
$error[0] # Most recent error
$error.Clear() # Clear the error variable
