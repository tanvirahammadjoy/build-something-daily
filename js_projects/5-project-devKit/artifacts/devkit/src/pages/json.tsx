import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", duration: 2000 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-2xl font-bold font-mono">JSON Formatter & Validator</h1>
        <p className="text-muted-foreground text-sm">Format, minify, and validate JSON data.</p>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleFormat}>Format</Button>
        <Button onClick={handleMinify} variant="secondary">Minify</Button>
      </div>

      {error ? (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md font-mono text-sm">
          {error}
        </div>
      ) : output ? (
        <div className="p-3 bg-green-500/10 text-green-500 rounded-md font-mono text-sm">
          Valid JSON
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <Textarea 
          placeholder="Paste JSON here..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono h-full resize-none"
        />
        <div className="relative h-full border border-border rounded-md bg-muted/50 overflow-auto">
          <pre className="p-4 font-mono text-sm whitespace-pre-wrap">{output}</pre>
          {output && (
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute top-2 right-2"
              onClick={handleCopy}
            >
              Copy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
