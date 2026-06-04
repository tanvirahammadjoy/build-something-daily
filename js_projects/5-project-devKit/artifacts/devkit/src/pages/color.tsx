import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function hexToRgb(hex: string) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

export default function ColorConverter() {
  const [hex, setHex] = useState("#3b82f6");
  const { toast } = useToast();

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied!", duration: 2000 });
  };

  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const hsv = rgbToHsv(r, g, b);

  const colors = [
    { name: "HEX", value: hex.toUpperCase() },
    { name: "RGB", value: `rgb(${r}, ${g}, ${b})` },
    { name: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { name: "HSV", value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono">Color Converter</h1>
        <p className="text-muted-foreground text-sm">Convert between HEX, RGB, HSL, and HSV.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label>Pick a Color</Label>
            <div className="flex gap-4">
              <Input 
                type="color" 
                value={hex} 
                onChange={(e) => setHex(e.target.value)}
                className="w-20 h-20 p-1 cursor-pointer"
              />
              <Input 
                value={hex} 
                onChange={(e) => {
                  setHex(e.target.value);
                }}
                className="font-mono flex-1 text-lg uppercase h-20"
              />
            </div>
          </div>
        </div>

        <div className="w-full md:w-48 h-32 md:h-auto rounded-lg border border-border shadow-inner" style={{ backgroundColor: hex }}></div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {colors.map((c) => (
          <div key={c.name} className="flex flex-col gap-1 p-3 bg-muted/30 rounded-md border border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">{c.name}</span>
              <Button size="sm" variant="ghost" onClick={() => handleCopy(c.value)}>Copy</Button>
            </div>
            <div className="font-mono text-sm text-muted-foreground">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
