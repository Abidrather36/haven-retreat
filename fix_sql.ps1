$sqlver = "ComputerManagement16"

# 1. Enable TCP
$wmi = Get-WmiObject -Namespace "root\Microsoft\SqlServer\$sqlver" -Class ServerNetworkProtocol -Filter "ProtocolName='Tcp'"
if ($wmi) { $wmi.SetEnable() }

# 2. Change to Mixed Mode Authentication (SQL Server and Windows Authentication)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQLServer" -Name "LoginMode" -Value 2

# 3. Enable TCP Port 1433 explicitly on all IP addresses
$ipAll = Get-WmiObject -Namespace "root\Microsoft\SqlServer\$sqlver" -Class ServerNetworkProtocolProperty -Filter "ProtocolName='Tcp' and IPAddressName='IPAll' and PropertyName='TcpPort'"
if ($ipAll) { $ipAll.SetStringValue("1433") }

# 4. Restart SQL Server to apply changes
Restart-Service MSSQLSERVER -Force

# 5. Set the SA password and enable the account
Import-Module SqlServer
$query = @"
USE [master]
GO
ALTER LOGIN sa WITH PASSWORD = 'YourStrongPassword123!';
ALTER LOGIN sa ENABLE;
"@
Invoke-Sqlcmd -Query $query -ServerInstance "localhost"

Write-Host "ALL DONE! You can close this window now."
Start-Sleep -Seconds 5
