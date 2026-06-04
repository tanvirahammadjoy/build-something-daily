import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from "uuid";

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [format, setFormat] = useState<"standard" | "uppercase" | "no-hyphens">("standard");
  const { toast } = useToast();

  const generate = () => {
    const newUuids = Array.from({ length: 10 }, () => {
      let u = uuidv4();
      if (format === "uppercase") u = u.toUpperCase();
      if (format === "no-hyphens") u = u.replace(/-/g, "");
      return u;
    });
    setUuids(newUuids);
  };

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied!", duration: 2000 });
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"));
    toast({ title: "Copied all UUIDs!", duration: 2000 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono">UUID Generator</h1>
        <p className="text-muted-foreground text-sm">Generate v4 UUIDs in bulk.</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="space-y-2 flex-1 max-w-[200px]">
          <label className="text-sm font-medium">Format</label>
          <Select value={format} onValueChange={(v: any) => setFormat(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="uppercase">UPPERCASE</SelectItem>
              <SelectItem value="no-hyphens">No Hyphens</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generate}>Generate 10 UUIDs</Button>
        {uuids.length > 0 && <Button variant="secondary" onClick={handleCopyAll}>Copy All</Button>}
      </div>

      {uuids.length > 0 && (
        <div className="grid gap-2 mt-4">
          {uuids.map((u, i) => (
            <div key={i} className="flex justify-between items-center p-2 px-3 bg-muted/30 border border-border rounded-md">
              <span className="font-mono text-sm">{u}</span>
              <Button size="sm" variant="ghost" onClick={() => handleCopy(u)}>Copy</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
