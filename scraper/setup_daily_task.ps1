# PowerShell script to set up Windows Task Scheduler for daily scraping
# Run this as Administrator

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonPath = Join-Path $scriptPath ".venv\Scripts\python.exe"
$mainPyPath = Join-Path $scriptPath "main.py"

# Task details
$taskName = "NewsAggregatorDailyScraper"
$description = "Daily news scraping for sentiment analysis"
$time = "06:00AM"  # Change this to your preferred time

Write-Host "Creating Windows Task Scheduler task..." -ForegroundColor Cyan
Write-Host "Task Name: $taskName" -ForegroundColor Yellow
Write-Host "Run Time: $time daily" -ForegroundColor Yellow
Write-Host "Working Directory: $scriptPath" -ForegroundColor Yellow

# Create the action
$action = New-ScheduledTaskAction -Execute $pythonPath -Argument "main.py --once" -WorkingDirectory $scriptPath

# Create the trigger (daily at specified time)
$trigger = New-ScheduledTaskTrigger -Daily -At $time

# Create the principal (run whether user is logged on or not)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType ServiceAccount -RunLevel Highest

# Create the settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register the task
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description $description -Force
    Write-Host "`n✅ Task created successfully!" -ForegroundColor Green
    Write-Host "The scraper will run daily at $time" -ForegroundColor Green
    Write-Host "`nTo view/edit the task:" -ForegroundColor Cyan
    Write-Host "1. Open Task Scheduler (taskschd.msc)" -ForegroundColor White
    Write-Host "2. Look for '$taskName'" -ForegroundColor White
} catch {
    Write-Host "`n❌ Error creating task: $_" -ForegroundColor Red
    Write-Host "Make sure you're running PowerShell as Administrator" -ForegroundColor Yellow
}

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
