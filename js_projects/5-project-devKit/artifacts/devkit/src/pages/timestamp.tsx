import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function TimestampConverter() {
  const [input, setInput] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000));
  const { toast } = useToast();

  useEffect(() => {
    if (!autoRefresh) return;
    const int = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(int);
  }, [autoRefresh]);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied!", duration: 2000 });
  };

  const parsedDate = (() => {
    if (!input) return null;
    let d: Date;
    // Check if it's a number (unix timestamp)
    if (/^\d+$/.test(input)) {
      const num = parseInt(input, 10);
      // If it's seemingly in ms
      if (input.length > 10) d = new Date(num);
      else d = new Date(num * 1000);
    } else {
      d = new Date(input);
    }
    return isNaN(d.getTime()) ? null : d;
  })();

  const copyRow = (label: string, value: string) => (
    <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-md border border-border">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-sm">{label}</span>
        <Button size="sm" variant="ghost" onClick={() => handleCopy(value)}>Copy</Button>
      </div>
      <div className="font-mono text-sm text-muted-foreground">{value}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono">Timestamp Converter</h1>
        <p className="text-muted-foreground text-sm">Convert Unix timestamps to readable dates and vice-versa.</p>
      </div>

      <div className="p-6 bg-card border border-border rounded-lg flex items-center justify-between">
        <div>
          <Label className="text-muted-foreground">Current Unix Timestamp</Label>
          <div className="text-3xl font-mono mt-1 font-bold tracking-tight">{currentTimestamp}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="auto-refresh" className="cursor-pointer">Auto-refresh</Label>
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <Button variant="secondary" onClick={() => handleCopy(currentTimestamp.toString())}>Copy</Button>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <Label>Input (Timestamp or Date String)</Label>
          <Input 
            placeholder="e.g. 1718293847 or 2024-06-13T12:00:00Z"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono text-lg py-6"
          />
        </div>

        {input && !parsedDate && (
          <div className="text-destructive text-sm font-mono">Invalid date format</div>
        )}

        {parsedDate && (
          <div className="grid gap-3 pt-4">
            {copyRow("Unix Timestamp (Seconds)", Math.floor(parsedDate.getTime() / 1000).toString())}
            {copyRow("Unix Timestamp (Milliseconds)", parsedDate.getTime().toString())}
            {copyRow("Local Time", new Intl.DateTimeFormat('default', { dateStyle: 'full', timeStyle: 'long' }).format(parsedDate))}
            {copyRow("ISO 8601", parsedDate.toISOString())}
            {copyRow("UTC Time", parsedDate.toUTCString())}
          </div>
        )}
      </div>
    </div>
  );
}
