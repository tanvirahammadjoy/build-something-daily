import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function JwtDecoder() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<{ header: any, payload: any, signature: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProcess = (val: string) => {
    setInput(val);
    if (!val) {
      setDecoded(null);
      setError(null);
      return;
    }
    
    try {
      const parts = val.split(".");
      if (parts.length !== 3) throw new Error("Invalid JWT format (must have 3 parts)");
      
      const decodeBase64Url = (str: string) => {
        const s = str.replace(/-/g, "+").replace(/_/g, "/");
        const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
        return atob(padded);
      };
      const header = JSON.parse(decodeBase64Url(parts[0]));
      const payload = JSON.parse(decodeBase64Url(parts[1]));
      const signature = parts[2];
      
      setDecoded({ header, payload, signature });
      setError(null);
    } catch (e: any) {
      setDecoded(null);
      setError("Invalid JWT token");
    }
  };

  const handleCopyPayload = () => {
    if (decoded?.payload) {
      navigator.clipboard.writeText(JSON.stringify(decoded.payload, null, 2));
      toast({ title: "Copied!", duration: 2000 });
    }
  };

  const isExpired = decoded?.payload?.exp ? (decoded.payload.exp * 1000) < Date.now() : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono">JWT Decoder</h1>
        <p className="text-muted-foreground text-sm">Decode JSON Web Tokens.</p>
      </div>

      <Textarea 
        placeholder="Paste JWT here..."
        value={input}
        onChange={(e) => handleProcess(e.target.value)}
        className="font-mono min-h-[120px] break-all"
      />

      {error && <div className="text-destructive text-sm font-mono">{error}</div>}

      {decoded && (
        <div className="space-y-4">
          {decoded.payload.exp && (
            <div className={`p-3 rounded-md border text-sm font-medium ${isExpired ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
              {isExpired ? "Token Expired on " : "Token Valid until "}
              {new Date(decoded.payload.exp * 1000).toLocaleString()}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Header</h3>
              <div className="bg-muted/50 p-4 rounded-md border font-mono text-sm overflow-auto">
                <pre>{JSON.stringify(decoded.header, null, 2)}</pre>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Payload</h3>
                <Button size="sm" variant="secondary" onClick={handleCopyPayload}>Copy</Button>
              </div>
              <div className="bg-muted/50 p-4 rounded-md border font-mono text-sm overflow-auto">
                <pre>{JSON.stringify(decoded.payload, null, 2)}</pre>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Signature</h3>
            <div className="bg-muted/50 p-4 rounded-md border font-mono text-sm overflow-auto break-all">
              {decoded.signature}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
