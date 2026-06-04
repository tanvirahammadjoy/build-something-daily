import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BaseConverter() {
  const [input, setInput] = useState("42");
  const { toast } = useToast();

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied!", duration: 2000 });
  };

  const parsed = (() => {
    if (!input) return null;
    try {
      // Clean input: remove spaces, prefixes like 0x, 0b
      let cleanInput = input.trim().toLowerCase();
      let radix = 10;
      
      if (cleanInput.startsWith("0x")) { radix = 16; cleanInput = cleanInput.slice(2); }
      else if (cleanInput.startsWith("0b")) { radix = 2; cleanInput = cleanInput.slice(2); }
      else if (cleanInput.startsWith("0o")) { radix = 8; cleanInput = cleanInput.slice(2); }
      // Attempt to guess if it has letters it must be hex
      else if (/^[0-9a-f]+$/.test(cleanInput) && /[a-f]/.test(cleanInput)) { radix = 16; }

      const num = parseInt(cleanInput, radix);
      if (isNaN(num)) return null;
      return num;
    } catch {
      return null;
    }
  })();

  const padBinary = (binStr: string, bits: number) => {
    if (binStr.length >= bits) return binStr;
    return binStr.padStart(bits, '0');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono">Number Base Converter</h1>
        <p className="text-muted-foreground text-sm">Convert numbers between decimal, binary, octal, and hexadecimal.</p>
      </div>

      <div className="space-y-2 pb-6 border-b border-border">
        <Label>Input Number (auto-detects base)</Label>
        <Input 
          placeholder="e.g. 42, 0x2A, 101010"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono text-xl py-6"
        />
        {input && parsed === null && (
          <div className="text-destructive font-mono text-sm mt-1">Invalid number format</div>
        )}
      </div>

      {parsed !== null && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-md border border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">Decimal (Base 10)</span>
              <Button size="sm" variant="ghost" onClick={() => handleCopy(parsed.toString(10))}>Copy</Button>
            </div>
            <div className="font-mono text-2xl text-foreground mt-2">{parsed.toString(10)}</div>
          </div>

          <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-md border border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">Hexadecimal (Base 16)</span>
              <Button size="sm" variant="ghost" onClick={() => handleCopy(parsed.toString(16).toUpperCase())}>Copy</Button>
            </div>
            <div className="font-mono text-2xl text-foreground mt-2 uppercase">{parsed.toString(16)}</div>
          </div>

          <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-md border border-border sm:col-span-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">Binary (Base 2)</span>
              <Button size="sm" variant="ghost" onClick={() => handleCopy(parsed.toString(2))}>Copy</Button>
            </div>
            <div className="font-mono text-2xl text-foreground mt-2 break-all">{parsed.toString(2)}</div>
            
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50 text-xs font-mono text-muted-foreground">
              <div>
                <span className="block mb-1 font-semibold">8-bit</span>
                {padBinary(parsed.toString(2), 8)}
              </div>
              <div>
                <span className="block mb-1 font-semibold">16-bit</span>
                {padBinary(parsed.toString(2), 16)}
              </div>
              <div>
                <span className="block mb-1 font-semibold">32-bit</span>
                {padBinary(parsed.toString(2), 32)}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-4 bg-muted/30 rounded-md border border-border sm:col-span-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">Octal (Base 8)</span>
              <Button size="sm" variant="ghost" onClick={() => handleCopy(parsed.toString(8))}>Copy</Button>
            </div>
            <div className="font-mono text-2xl text-foreground mt-2">{parsed.toString(8)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
