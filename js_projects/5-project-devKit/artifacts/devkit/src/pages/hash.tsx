import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CryptoJS from "crypto-js";

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [secret, setSecret] = useState("");
  const { toast } = useToast();

  const hashes = useMemo(() => {
    if (!input) return [];
    
    if (secret) {
      return [
        { name: "HMAC-MD5", value: CryptoJS.HmacMD5(input, secret).toString() },
        { name: "HMAC-SHA1", value: CryptoJS.HmacSHA1(input, secret).toString() },
        { name: "HMAC-SHA256", value: CryptoJS.HmacSHA256(input, secret).toString() },
        { name: "HMAC-SHA512", value: CryptoJS.HmacSHA512(input, secret).toString() },
      ];
    }

    return [
      { name: "MD5", value: CryptoJS.MD5(input).toString() },
      { name: "SHA-1", value: CryptoJS.SHA1(input).toString() },
      { name: "SHA-256", value: CryptoJS.SHA256(input).toString() },
      { name: "SHA-512", value: CryptoJS.SHA512(input).toString() },
    ];
  }, [input, secret]);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied!", duration: 2000 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono">Hash Generator</h1>
        <p className="text-muted-foreground text-sm">Generate cryptographic hashes for text.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Input Text</Label>
          <Textarea 
            placeholder="Text to hash..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>HMAC Secret Key (Optional)</Label>
          <Input 
            placeholder="Secret key for HMAC..."
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="font-mono"
          />
        </div>
      </div>

      {hashes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Hashes</h2>
          <div className="grid gap-3">
            {hashes.map((h) => (
              <div key={h.name} className="flex flex-col gap-1 p-3 bg-muted/30 rounded-md border border-border">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">{h.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => handleCopy(h.value)}>Copy</Button>
                </div>
                <div className="font-mono text-sm break-all text-muted-foreground">{h.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
