import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";

export default function Base64() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processText = (val: string, currentMode: "encode" | "decode") => {
    setFileName(null);
    setInput(val);
    if (!val) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (currentMode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(val))));
      } else {
        setOutput(decodeURIComponent(escape(atob(val))));
      }
      setError(null);
    } catch {
      setOutput("");
      setError(currentMode === "decode" ? "Invalid Base64 string" : "Encoding failed");
    }
  };

  const handleModeChange = (newMode: string) => {
    const m = newMode as "encode" | "decode";
    setMode(m);
    processText(input, m);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setInput("");
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      if (mode === "encode") {
        setOutput(base64);
        setError(null);
      } else {
        setInput(base64);
        try {
          setOutput(decodeURIComponent(escape(atob(base64))));
          setError(null);
        } catch {
          setOutput("");
          setError("File content is not valid Base64");
        }
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", duration: 2000 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-2xl font-bold font-mono">Base64 Encoder/Decoder</h1>
        <p className="text-muted-foreground text-sm">Encode to or decode from Base64 format. Supports text and files.</p>
      </div>

      <Tabs value={mode} onValueChange={handleModeChange} className="w-full flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <TabsList className="w-fit">
            <TabsTrigger value="encode" data-testid="tab-encode">Encode</TabsTrigger>
            <TabsTrigger value="decode" data-testid="tab-decode">Decode</TabsTrigger>
          </TabsList>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              data-testid="input-file"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-file"
            >
              <Upload className="h-4 w-4 mr-2" />
              {mode === "encode" ? "Encode File" : "Decode from File"}
            </Button>
          </div>
        </div>

        <TabsContent value="encode" className="flex-1 flex flex-col gap-4 mt-4">
          <Textarea
            placeholder="Text to encode..."
            value={input}
            onChange={(e) => processText(e.target.value, "encode")}
            className="font-mono flex-1 resize-none"
            data-testid="textarea-encode-input"
          />
        </TabsContent>
        <TabsContent value="decode" className="flex-1 flex flex-col gap-4 mt-4">
          <Textarea
            placeholder="Base64 to decode..."
            value={input}
            onChange={(e) => processText(e.target.value, "decode")}
            className="font-mono flex-1 resize-none"
            data-testid="textarea-decode-input"
          />
        </TabsContent>

        {fileName && (
          <div className="text-xs font-mono text-muted-foreground">
            File: {fileName}
          </div>
        )}
        {error && <div className="text-destructive font-mono text-sm">{error}</div>}

        <div className="relative flex-1 border border-border rounded-md bg-muted/50 p-4">
          <pre className="font-mono text-sm whitespace-pre-wrap break-all">{output}</pre>
          {output && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2"
              onClick={handleCopy}
              data-testid="button-copy-output"
            >
              Copy
            </Button>
          )}
        </div>
      </Tabs>
    </div>
  );
}
