Invoke-RestMethod -Uri "http://localhost:3000/api/cron?key=royalsv123" -Method Get

DELETE FROM "Notification" WHERE "title" = 'Check-in Reminder';

Method 1: Using Command Line (Fastest)
Open PowerShell as Administrator and run the following command. This will automatically create a task named "HRMS_Cron" that runs every 5 minutes:

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -Command `"Invoke-RestMethod -Uri 'https://hrms.infraplan.co.in/api/cron?key=royalsv105' -Method Get`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName "HRMS_Cron" -Action $action -Trigger $trigger -User "SYSTEM" -RunLevel Highest
