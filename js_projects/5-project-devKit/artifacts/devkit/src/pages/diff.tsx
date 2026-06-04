import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as Diff from "diff";
import { useToast } from "@/hooks/use-toast";

export default function DiffViewer() {
  const [original, setOriginal] = useState("Hello world\nThis is a diff tool\nHope you like it");
  const [modified, setModified] = useState("Hello world\nThis is an awesome diff tool\nHope you love it");
  const [view, setView] = useState<"inline" | "split">("inline");
  const { toast } = useToast();

  const diffResult = useMemo(() => Diff.diffLines(original, modified), [original, modified]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffResult.forEach(part => {
      if (part.added) added += part.count || 0;
      if (part.removed) removed += part.count || 0;
    });
    return { added, removed };
  }, [diffResult]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-2xl font-bold font-mono">Diff Viewer</h1>
        <p className="text-muted-foreground text-sm">Compare text line by line.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-none">
        <div className="space-y-2">
          <div className="font-semibold text-sm text-muted-foreground">Original</div>
          <Textarea 
            value={original}
            onChange={e => setOriginal(e.target.value)}
            className="font-mono min-h-[150px] resize-y"
          />
        </div>
        <div className="space-y-2">
          <div className="font-semibold text-sm text-muted-foreground">Modified</div>
          <Textarea 
            value={modified}
            onChange={e => setModified(e.target.value)}
            className="font-mono min-h-[150px] resize-y"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm font-mono">
          <span className="text-green-500 font-semibold">+{stats.added} additions</span>
          <span className="text-destructive font-semibold">-{stats.removed} deletions</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const text = diffResult
                .map(p => p.value.split("\n").filter(l => l !== "").map(l => (p.added ? "+ " : p.removed ? "- " : "  ") + l).join("\n"))
                .join("\n");
              navigator.clipboard.writeText(text);
              toast({ title: "Copied diff!", duration: 2000 });
            }}
            data-testid="button-copy-diff"
          >
            Copy Diff
          </Button>
          <Tabs value={view} onValueChange={(v: any) => setView(v)}>
            <TabsList>
              <TabsTrigger value="inline">Inline</TabsTrigger>
              <TabsTrigger value="split">Side-by-side</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-lg overflow-auto font-mono text-sm leading-relaxed p-4">
        {view === "inline" ? (
          <div>
            {diffResult.map((part, i) => (
              <span key={i} className={`
                ${part.added ? 'bg-green-500/20 text-green-700 dark:text-green-400 block' : ''}
                ${part.removed ? 'bg-destructive/20 text-destructive block line-through' : ''}
                ${!part.added && !part.removed ? 'text-muted-foreground' : ''}
              `}>
                {part.value}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex w-full">
            <div className="w-1/2 border-r border-border pr-2">
              {diffResult.map((part, i) => !part.added && (
                <div key={i} className={`whitespace-pre-wrap ${part.removed ? 'bg-destructive/20 text-destructive' : 'text-muted-foreground'}`}>
                  {part.value}
                </div>
              ))}
            </div>
            <div className="w-1/2 pl-2">
              {diffResult.map((part, i) => !part.removed && (
                <div key={i} className={`whitespace-pre-wrap ${part.added ? 'bg-green-500/20 text-green-700 dark:text-green-400' : 'text-muted-foreground'}`}>
                  {part.value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
