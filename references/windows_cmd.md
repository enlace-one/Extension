dir	cd ..	chdir	exit
certutil –hashfile “C:/[path]” SHA256
dir /r #see ADSs
dir "search term*" /s #Search
echo “hidden text” > filename.txt:hiddenpart
more < filename.txt:hiddenpart
type file.txt
dir c:\ /b/s | find “password” #findfiles
whoami

Network:
tracert 4.4.4.4
ping 4.4.4.4
ipconfig /all
pathping #tracert + ping
nslookup dell.com
color 2 #green
netstat print #view routing table
netstat –a
arp –a #show arp table
route #show route table
net view
nbtstat –a computername
curl google.com #gets

Cybersecurity: 
net user user1 P@ssw0rd /add
net group "domain admins" user1 /add
set 	#view all environmental variables
cd C:\$Recycle.Bin
net user #get users
net accounts #pw settings

Specific:
shutdown -r -f -t 1
setx /M path "%path%;C:\your\path"
