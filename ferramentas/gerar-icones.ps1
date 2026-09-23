# GAITERO MATH — prepara as imagens do app.
# - Ícones (192, 512, maskable, apple-touch) a partir de assets\gustavo-avatar.png
#   (sem avatar, recorta o rosto da arte de abertura; sem nenhuma imagem, cria um "G" provisório).
# - assets\avatar.jpg (256 px, leve) para as telas; gustavo-avatar.png reduzido para 512 px
#   (o original maior vai para ..\..\gaitero-math-originais\).
# - assets\splash.jpg: cópia leve da arte de abertura, para abrir rápido no celular.
# Trocou a foto do avatar ou a arte? Rode este script de novo.
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\gerar-icones.ps1

Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root 'assets'
$splashPath = Join-Path $assets 'splash_educativo_gaitero_math.png'
$avatarPath = Join-Path $assets 'gustavo-avatar.png'
$backupDir = Join-Path (Split-Path -Parent $root) 'gaitero-math-originais'
$green = [System.Drawing.Color]::FromArgb(255, 88, 204, 2)

function New-Canvas([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  return @($bmp, $g)
}
function Save-Png($bmp, [string]$path) {
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Output ("  " + (Split-Path -Leaf $path) + " (" + $bmp.Width + "x" + $bmp.Height + ")")
}
function Save-Jpg($bmp, [string]$path, [int]$quality) {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $params = New-Object System.Drawing.Imaging.EncoderParameters 1
  $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]$quality)
  $bmp.Save($path, $codec, $params)
  Write-Output ("  " + (Split-Path -Leaf $path) + " (" + $bmp.Width + "x" + $bmp.Height + ", " + [int]((Get-Item $path).Length / 1024) + " KB)")
}
# Desenha um quadrado da imagem de origem num quadrado de "size" px.
function Draw-Square($srcImg, $srcRect, [int]$size, [string]$path) {
  $c = New-Canvas $size $size
  $dst = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $c[1].DrawImage($srcImg, $dst, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  Save-Png $c[0] $path
  $c[1].Dispose(); $c[0].Dispose()
}

# 1) Origem dos ícones
$src = $null; $srcRect = $null
if (Test-Path $avatarPath) {
  $bytes = [IO.File]::ReadAllBytes($avatarPath)
  $src = [System.Drawing.Image]::FromStream((New-Object IO.MemoryStream (, $bytes)))
  $s = [Math]::Min($src.Width, $src.Height)
  $srcRect = New-Object System.Drawing.Rectangle ([int](($src.Width - $s) / 2)), ([int](($src.Height - $s) / 2)), $s, $s
  Write-Output "Ícones a partir do avatar (gustavo-avatar.png):"
} elseif (Test-Path $splashPath) {
  $bytes = [IO.File]::ReadAllBytes($splashPath)
  $src = [System.Drawing.Image]::FromStream((New-Object IO.MemoryStream (, $bytes)))
  # rosto na arte 941 x 1672
  $srcRect = New-Object System.Drawing.Rectangle ([int]($src.Width * 150 / 941)), ([int]($src.Height * 440 / 1672)), ([int]($src.Width * 660 / 941)), ([int]($src.Width * 660 / 941))
  Write-Output "Ícones a partir do rosto recortado da arte de abertura:"
}

if ($src) {
  Draw-Square $src $srcRect 512 (Join-Path $assets 'icon-512.png')
  Draw-Square $src $srcRect 192 (Join-Path $assets 'icon-192.png')
  Draw-Square $src $srcRect 180 (Join-Path $assets 'apple-touch-icon.png')
  # maskable: o Android pode cortar as bordas, então o rosto vai um pouco menor sobre fundo verde
  $c = New-Canvas 512 512
  $c[1].Clear($green)
  $dst = New-Object System.Drawing.Rectangle 40, 40, 432, 432
  $c[1].DrawImage($src, $dst, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  Save-Png $c[0] (Join-Path $assets 'icon-maskable-512.png')
  $c[1].Dispose(); $c[0].Dispose()

  # 2) avatar.jpg (256 px): o que o app mostra nas telas, bem leve
  $c = New-Canvas 256 256
  $c[1].DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, 256, 256), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  Save-Jpg $c[0] (Join-Path $assets 'avatar.jpg') 86
  $c[1].Dispose(); $c[0].Dispose()

  # Avatar em PNG reduzido para 512 px; guarda o original grande fora da pasta do app
  if ((Test-Path $avatarPath) -and ($src.Width -gt 512)) {
    New-Item -ItemType Directory -Force $backupDir | Out-Null
    Copy-Item -LiteralPath $avatarPath -Destination (Join-Path $backupDir 'gustavo-avatar-original.png') -Force
    $c = New-Canvas 512 512
    $c[1].DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, 512, 512), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $src.Dispose()
    Save-Png $c[0] $avatarPath
    $c[1].Dispose(); $c[0].Dispose()
    Write-Output ("  original guardado em " + $backupDir)
  } else { $src.Dispose() }
} else {
  Write-Output "Sem imagens em assets: gerando ícones provisórios..."
  foreach ($spec in @(@('icon-512.png', 512), @('icon-192.png', 192), @('apple-touch-icon.png', 180), @('icon-maskable-512.png', 512))) {
    $n = $spec[1]
    $c = New-Canvas $n $n
    $c[1].Clear($green)
    $font = New-Object System.Drawing.Font 'Arial Black', ([single]($n * 0.52)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
    $fmt = New-Object System.Drawing.StringFormat
    $fmt.Alignment = 'Center'; $fmt.LineAlignment = 'Center'
    $rect = New-Object System.Drawing.RectangleF 0, ([single]($n * 0.04)), $n, $n
    $c[1].DrawString('G', $font, [System.Drawing.Brushes]::White, $rect, $fmt)
    Save-Png $c[0] (Join-Path $assets $spec[0])
    $font.Dispose(); $c[1].Dispose(); $c[0].Dispose()
  }
}

# 3) Abertura leve em JPG
if (Test-Path $splashPath) {
  Write-Output "Abertura:"
  $bytes = [IO.File]::ReadAllBytes($splashPath)
  $art = [System.Drawing.Image]::FromStream((New-Object IO.MemoryStream (, $bytes)))
  $c = New-Canvas $art.Width $art.Height
  $c[1].DrawImage($art, 0, 0, $art.Width, $art.Height)
  Save-Jpg $c[0] (Join-Path $assets 'splash.jpg') 84
  $c[1].Dispose(); $c[0].Dispose(); $art.Dispose()
}
Write-Output "Pronto."
