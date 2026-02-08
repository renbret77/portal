# Script para dividir archivo SQL grande en partes
# Autor: Antigravity Co-Pilot

$inputFile = "c:\Users\RENE\OneDrive - renebreton.mx\PROYECTO_SAAS_SEGUROS\portal\seed_sepomex_optimized.sql"
$outputBase = "c:\Users\RENE\OneDrive - renebreton.mx\PROYECTO_SAAS_SEGUROS\portal\seed_sepomex_part"

Write-Host "Leyendo archivo gigante..."
$lines = Get-Content $inputFile -Encoding UTF8

# Tamaño de bloque (líneas) - Supabase aguanta bien unas 2000-3000 filas insertadas
# El archivo tiene INSERTs de 1000 en 1000 values.
# Vamos a cortar por ocurrencia de "INSERT INTO" para no romper la sintaxis.

$chunkSize = 5 # Número de bloques INSERT por archivo (5 * 1000 = 5000 registros por archivo)
$currentPart = 1
$currentLines = @()
$insertCount = 0

# Encabezado (TRUNCATE solo en la parte 1)
$header = "-- PARTE $currentPart"
if ($currentPart -eq 1) {
    $header += "`nTRUNCATE public.postal_codes_catalog;"
}

$currentLines += $header

foreach ($line in $lines) {
    if ($line.StartsWith("INSERT INTO")) {
        $insertCount++
    }
    
    if ($insertCount -gt $chunkSize) {
        # Escribir archivo actual
        $outFile = "${outputBase}${currentPart}.sql"
        $currentLines | Out-File $outFile -Encoding UTF8
        Write-Host "Generado: $outFile"
        
        # Reset para siguiente parte
        $currentPart++
        $insertCount = 1
        $currentLines = @()
        $currentLines += "-- PARTE $currentPart (Continuación)"
    }
    
    $currentLines += $line
}

# Escribir el último resto
if ($currentLines.Count -gt 0) {
    $outFile = "${outputBase}${currentPart}.sql"
    $currentLines | Out-File $outFile -Encoding UTF8
    Write-Host "Generado: $outFile (Final)"
}
