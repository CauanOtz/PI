Get-ChildItem -Path "." -Filter "*.js" | 
ForEach-Object {
    Rename-Item -Path $_.FullName -NewName $_.Name.Replace('.js','.cjs')
}