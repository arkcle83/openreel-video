Set shell = CreateObject("Wscript.Shell")
Set fileSystem = CreateObject("Scripting.FileSystemObject")
repository = fileSystem.GetParentFolderName(WScript.ScriptFullName)

shell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & repository & "\start.ps1""", 0, False
