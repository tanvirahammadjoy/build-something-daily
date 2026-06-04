import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const { toast } = useToast();

  const handleProcess = (val: string, currentMode: "encode" | "decode") => {
    setInput(val);
    if (!val) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (currentMode === "encode") {
        setOutput(encodeURIComponent(val));
      } else {
        setOutput(decodeURIComponent(val));
      }
      setError(null);
    } catch (e: any) {
      setOutput("");
      setError("Invalid URL encoding");
    }
  };

  const handleModeChange = (newMode: string) => {
    const m = newMode as "encode" | "decode";
    setMode(m);
    handleProcess(input, m);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", duration: 2000 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-2xl font-bold font-mono">URL Encoder/Decoder</h1>
        <p className="text-muted-foreground text-sm">Encode or decode URL-encoded strings.</p>
      </div>

      <Tabs value={mode} onValueChange={handleModeChange} className="w-full flex-1 flex flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex-1 flex flex-col gap-4">
          <Textarea 
            placeholder={mode === "encode" ? "Text to encode..." : "URL to decode..."}
            value={input}
            onChange={(e) => handleProcess(e.target.value, mode)}
            className="font-mono flex-1 resize-none"
          />
          {error && <div className="text-destructive font-mono text-sm">{error}</div>}
          <div className="relative flex-1 border border-border rounded-md bg-muted/50 p-4">
            <pre className="font-mono text-sm whitespace-pre-wrap break-all">{output}</pre>
            {output && (
              <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={handleCopy}>
                Copy
              </Button>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
