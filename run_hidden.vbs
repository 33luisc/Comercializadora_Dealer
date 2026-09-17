Set WshShell = CreateObject("WScript.Shell")
' Obtiene la ruta de la carpeta donde reside este archivo .vbs
scriptPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
' Establece esa carpeta como el directorio de trabajo activo
WshShell.CurrentDirectory = scriptPath

' Ejecuta el archivo .bat pasado como argumento en modo oculto (0)
WshShell.Run """" & WScript.Arguments(0) & """", 0, False