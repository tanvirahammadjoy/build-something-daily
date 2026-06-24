Add-Type -AssemblyName System.Drawing

$assetPath = Join-Path (Split-Path -Parent $PSScriptRoot) "public\assets\sprigly-product.png"
$bmp = New-Object Drawing.Bitmap 1400, 1000
$g = [Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([Drawing.Color]::FromArgb(0, 0, 0, 0))

function New-Brush($hex) {
  New-Object Drawing.SolidBrush ([Drawing.ColorTranslator]::FromHtml($hex))
}

function New-Pen($hex, $width) {
  New-Object Drawing.Pen -ArgumentList ([Drawing.ColorTranslator]::FromHtml($hex)), $width
}

$shadow = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(42, 38, 61, 42))
$g.FillEllipse($shadow, 290, 798, 850, 80)

$body = New-Brush "#f8fbf4"
$edge = New-Pen "#254232" 8
$g.FillRectangle($body, 270, 605, 860, 180)
$g.FillEllipse($body, 270, 580, 180, 230)
$g.FillEllipse($body, 950, 580, 180, 230)
$g.DrawLine($edge, 360, 580, 1040, 580)
$g.DrawLine($edge, 360, 810, 1040, 810)
$g.DrawArc($edge, 270, 580, 180, 230, 90, 180)
$g.DrawArc($edge, 950, 580, 180, 230, 270, 180)

$water = New-Brush "#d8efcf"
$g.FillRectangle($water, 326, 642, 748, 82)
$g.DrawRectangle((New-Pen "#7da56a" 4), 326, 642, 748, 82)

$dark = New-Brush "#203227"
$g.FillRectangle($dark, 420, 200, 530, 72)
$g.FillEllipse($dark, 420, 200, 72, 72)
$g.FillEllipse($dark, 878, 200, 72, 72)
$g.FillRectangle($dark, 402, 254, 42, 370)
$g.FillRectangle($dark, 906, 254, 42, 370)

$light = New-Brush "#f0c766"
$g.FillRectangle($light, 470, 222, 430, 20)

$leafBrushes = @(
  (New-Brush "#2f7d4b"),
  (New-Brush "#7da56a"),
  (New-Brush "#5c9a57"),
  (New-Brush "#93bd74")
)
$stems = @(460, 540, 620, 700, 780, 860)

for ($i = 0; $i -lt $stems.Count; $i++) {
  [int]$x = $stems[$i]
  $stemPen = New-Pen "#2f7d4b" 7
  $g.DrawCurve($stemPen, @(
      (New-Object Drawing.Point -ArgumentList $x, 622),
      (New-Object Drawing.Point -ArgumentList ($x - 18), 510),
      (New-Object Drawing.Point -ArgumentList ($x + 28), 420),
      (New-Object Drawing.Point -ArgumentList ($x + 8), 330)
    ))

  for ($j = 0; $j -lt 5; $j++) {
    $lx = $x + (($j % 2) * 48) - 24
    $ly = 470 - ($j * 36) - (($i % 2) * 16)
    $brush = $leafBrushes[($i + $j) % $leafBrushes.Count]
    $g.FillEllipse($brush, $lx, $ly, 72, 38)
    $g.FillEllipse($brush, $lx - 34, $ly + 20, 64, 34)
  }
}

$display = New-Brush "#17211b"
$g.FillRectangle($display, 590, 748, 180, 34)
$indicator = New-Brush "#f0c766"
$g.FillEllipse($indicator, 798, 752, 26, 26)

$g.Dispose()
$bmp.Save($assetPath, [Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

Write-Output $assetPath
