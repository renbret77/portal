# Script para convertir CPdescarga.txt (SEPOMEX) a SQL optimizado para Supabase
# Autor: Antigravity Co-Pilot
# Fecha: 2026-02-06

$inputFile = "c:\Users\RENE\OneDrive - renebreton.mx\PROYECTO_SAAS_SEGUROS\CPdescarga.txt"
$outputFile = "c:\Users\RENE\OneDrive - renebreton.mx\PROYECTO_SAAS_SEGUROS\portal\seed_sepomex_optimized.sql"

Write-Host "Leyendo SEPOMEX desde: $inputFile"
$lines = Get-Content $inputFile -Encoding Default

Write-Host "Generando SQL..."
$sqlContent = @()
$sqlContent += "-- SEED MASIVO SEPOMEX (Optimizado)"
$sqlContent += "-- Generado automáticamente desde CPdescarga.txt"
$sqlContent += ""
$sqlContent += "TRUNCATE public.postal_codes_catalog;"
$sqlContent += ""

# Estructura para agrupar colonias por CP
$cpData = @{}

# Omitir las primeras 2 líneas (Copyright y Encabezados)
for ($i = 2; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    
    # Separar por pipe |
    $parts = $line.Split('|')
    
    # Mapeo según estándar SEPOMEX:
    # 0: d_codigo (CP)
    # 1: d_asenta (Nombre Colonia)
    # 2: d_tipo_asenta (Tipo: Colonia, Fracc, etc)
    # 3: D_mnpio (Municipio)
    # 4: d_estado (Estado)
    # 5: d_ciudad (Ciudad)
    
    $cp = $parts[0]
    $colonia = $parts[1]
    $municipio = $parts[3]
    $estado = $parts[4]
    $ciudad = $parts[5]
    
    # Limpieza: 1. Escape backslash (JSON) 2. Escape double quotes (JSON) 3. Escape single quotes (SQL)
    $colonia = $colonia.Replace('\', '\\').Replace('"', '\"').Replace("'", "''")
    $municipio = $municipio.Replace("'", "''")
    $estado = $estado.Replace("'", "''")
    $ciudad = $ciudad.Replace("'", "''")

    if (-not $cpData.ContainsKey($cp)) {
        $cpData[$cp] = @{
            Mnpio    = $municipio
            Estado   = $estado
            Ciudad   = $ciudad
            Colonias = @()
        }
    }
    
    # Agregar colonia a la lista de este CP
    $cpData[$cp].Colonias += $colonia
}

Write-Host "Procesando $($cpData.Count) Códigos Postales únicos..."

# Generar Inserts en lotes (chunks)
$batchSize = 1000
$count = 0
$values = @()

foreach ($cp in $cpData.Keys) {
    $data = $cpData[$cp]
    
    # Construir JSON array de colonias: '["Polanco", "Granada"]'
    $coloniesJson = '["' + ($data.Colonias -join '","') + '"]'
    
    $row = "('$cp', '$($data.Mnpio)', '$($data.Estado)', '$($data.Ciudad)', '$coloniesJson')"
    $values += $row
    $count++
    
    if ($count % $batchSize -eq 0) {
        $sqlContent += "INSERT INTO public.postal_codes_catalog (zip_code, municipality, state, city, colonies) VALUES"
        $sqlContent += ($values -join ",") + ";"
        $values = @()
        Write-Host "Procesados $count registros..."
    }
}

# Remanente
if ($values.Count -gt 0) {
    $sqlContent += "INSERT INTO public.postal_codes_catalog (zip_code, municipality, state, city, colonies) VALUES"
    $sqlContent += ($values -join ",") + ";"
}

$sqlContent | Out-File $outputFile -Encoding UTF8
Write-Host "¡Listo! Archivo SQL generado en: $outputFile"
