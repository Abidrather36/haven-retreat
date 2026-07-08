$sqlver = "ComputerManagement16"
$wmi = Get-WmiObject -Namespace "root\Microsoft\SqlServer\$sqlver" -Class ServerNetworkProtocol -Filter "ProtocolName='Tcp'"
if ($wmi) { 
    $wmi.SetEnable() 
    Write-Host "TCP Enabled"
} else {
    Write-Host "WMI object not found for TCP"
}

# Change to Mixed Mode Authentication (SQL Server and Windows Authentication)
# 1 = Windows Auth, 2 = Mixed Mode
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQLServer" -Name "LoginMode" -Value 2

# Enable TCP Port 1433 explicitly on all IP addresses
$ipAll = Get-WmiObject -Namespace "root\Microsoft\SqlServer\$sqlver" -Class ServerNetworkProtocolProperty -Filter "ProtocolName='Tcp' and IPAddressName='IPAll' and PropertyName='TcpPort'"
if ($ipAll) {
    $ipAll.SetStringValue("1433")
    Write-Host "TCP Port 1433 set"
}

# Restart SQL Server to apply changes
Restart-Service MSSQLSERVER -Force
Write-Host "SQL Server Restarted"
