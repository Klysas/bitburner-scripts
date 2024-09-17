$url = "https://raw.githubusercontent.com/phyzical/bitburner/dev/src/ScriptEditor/NetscriptDefinitions.d.ts"
$destination = "NetscriptDefinitions.d.ts"

Invoke-WebRequest -Uri $url -OutFile $destination

$fileContent = Get-Content $destination -Raw
$updatedContent = "declare global { const NS: NS; }`r`n$fileContent"
[System.IO.File]::WriteAllText($destination, $updatedContent)

Write-Host "Latest NetscriptDefinitions downloaded successfully."