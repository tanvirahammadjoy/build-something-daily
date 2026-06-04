import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy } from "lucide-react";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const generate = () => {
    let charset = "";
    if (uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) charset += "0123456789";
    if (symbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    if (excludeAmbiguous) {
      charset = charset.replace(/[0O1lI]/g, "");
    }

    if (charset === "") {
      setPassword("");
      return;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(result);
  };

  useEffect(() => {
    generate();
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    toast({ title: "Copied!", duration: 2000 });
  };

  // Simple entropy calculation
  const calculateStrength = () => {
    let pool = 0;
    if (uppercase) pool += 26;
    if (lowercase) pool += 26;
    if (numbers) pool += 10;
    if (symbols) pool += 30;
    if (excludeAmbiguous) pool -= 5;
    
    if (pool === 0) return { label: "Weak", color: "bg-destructive" };
    
    const entropy = length * Math.log2(pool);
    if (entropy < 40) return { label: "Weak", color: "bg-destructive" };
    if (entropy < 60) return { label: "Fair", color: "bg-orange-500" };
    if (entropy < 80) return { label: "Strong", color: "bg-green-500" };
    return { label: "Very Strong", color: "bg-green-600" };
  };

  const strength = calculateStrength();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-mono">Password Generator</h1>
        <p className="text-muted-foreground text-sm">Generate secure, random passwords.</p>
      </div>

      <div className="relative">
        <div className="w-full bg-card border border-border p-6 rounded-lg text-center font-mono text-3xl break-all min-h-[100px] flex items-center justify-center">
          {password}
        </div>
        <Button 
          size="icon" 
          variant="secondary" 
          className="absolute top-4 right-4" 
          onClick={handleCopy}
          disabled={!password}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-muted-foreground">Strength: <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span></span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex gap-1">
          <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.label === 'Weak' ? '25%' : strength.label === 'Fair' ? '50%' : strength.label === 'Strong' ? '75%' : '100%' }}></div>
        </div>
      </div>

      <div className="space-y-6 bg-card border border-border p-6 rounded-lg">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Password Length</Label>
            <span className="font-mono">{length}</span>
          </div>
          <Slider 
            value={[length]} 
            min={8} 
            max={128} 
            step={1} 
            onValueChange={(v) => setLength(v[0])} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="uppercase" checked={uppercase} onCheckedChange={(c) => setUppercase(!!c)} />
            <label htmlFor="uppercase" className="text-sm font-medium cursor-pointer">Uppercase (A-Z)</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="lowercase" checked={lowercase} onCheckedChange={(c) => setLowercase(!!c)} />
            <label htmlFor="lowercase" className="text-sm font-medium cursor-pointer">Lowercase (a-z)</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="numbers" checked={numbers} onCheckedChange={(c) => setNumbers(!!c)} />
            <label htmlFor="numbers" className="text-sm font-medium cursor-pointer">Numbers (0-9)</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="symbols" checked={symbols} onCheckedChange={(c) => setSymbols(!!c)} />
            <label htmlFor="symbols" className="text-sm font-medium cursor-pointer">Symbols (!@#$)</label>
          </div>
          <div className="flex items-center space-x-2 col-span-2 mt-2">
            <Checkbox id="exclude" checked={excludeAmbiguous} onCheckedChange={(c) => setExcludeAmbiguous(!!c)} />
            <label htmlFor="exclude" className="text-sm font-medium cursor-pointer">Exclude Ambiguous Characters (i, l, 1, L, o, 0, O)</label>
          </div>
        </div>
        
        <div className="pt-4 border-t border-border flex justify-end">
          <Button onClick={generate} size="lg">Generate New Password</Button>
        </div>
      </div>
    </div>
  );
}
