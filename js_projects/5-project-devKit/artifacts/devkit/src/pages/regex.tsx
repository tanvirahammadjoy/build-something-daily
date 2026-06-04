import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegexTester() {
  const { toast } = useToast();
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false });
  const [testString, setTestString] = useState("");
  
  const flagStr = Object.entries(flags).filter(([_, v]) => v).map(([k]) => k).join('');

  const regexResult = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matches: [] };
    try {
      const regex = new RegExp(pattern, flagStr);
      let matchCount = 0;
      
      // We'll just do a basic match evaluation to get count and captures
      // Highlighting in a textarea is tricky, we can render an overlay or just a readonly div
      const matches = [];
      if (testString) {
        if (regex.global) {
          const allMatches = Array.from(testString.matchAll(regex));
          matchCount = allMatches.length;
          matches.push(...allMatches);
        } else {
          const m = testString.match(regex);
          if (m) {
            matchCount = 1;
            matches.push(m);
          }
        }
      }
      return { regex, error: null, matchCount, matches };
    } catch (e: any) {
      return { regex: null, error: e.message, matchCount: 0, matches: [] };
    }
  }, [pattern, flagStr, testString]);

  const renderHighlighted = () => {
    if (!regexResult.regex || !testString) return testString;
    if (regexResult.matchCount === 0) return testString;

    // Simple highlighting logic
    const parts = [];
    let lastIndex = 0;
    
    for (const match of regexResult.matches) {
      const index = match.index!;
      parts.push(testString.substring(lastIndex, index));
      parts.push(
        <mark key={index} className="bg-primary/30 text-foreground rounded-sm px-0.5">
          {match[0]}
        </mark>
      );
      lastIndex = index + match[0].length;
      
      // Prevent infinite loops if regex matches empty string
      if (match[0].length === 0) lastIndex++; 
    }
    parts.push(testString.substring(lastIndex));
    return parts;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-2xl font-bold font-mono">Regex Tester</h1>
        <p className="text-muted-foreground text-sm">Test and highlight regular expressions.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Regular Expression</Label>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xl text-muted-foreground">/</span>
            <Input 
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="pattern"
              className="font-mono flex-1 text-lg"
            />
            <span className="text-xl text-muted-foreground">/</span>
            <Input 
              value={flagStr}
              readOnly
              className="w-20 font-mono text-lg text-center"
            />
          </div>
          {regexResult.error && <div className="text-destructive text-sm font-mono">{regexResult.error}</div>}
        </div>

        <div className="flex gap-4 flex-wrap">
          {Object.keys(flags).map(f => (
            <div key={f} className="flex items-center space-x-2">
              <Checkbox 
                id={`flag-${f}`} 
                checked={flags[f as keyof typeof flags]}
                onCheckedChange={(c) => setFlags(prev => ({...prev, [f]: !!c}))}
              />
              <label htmlFor={`flag-${f}`} className="text-sm font-medium leading-none cursor-pointer">
                {f} - {f === 'g' ? 'Global' : f === 'i' ? 'Case insensitive' : f === 'm' ? 'Multiline' : f === 's' ? 'Dotall' : 'Unicode'}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex justify-between items-end">
          <Label>Test String</Label>
          <div className="text-sm font-mono text-muted-foreground">
            {regexResult.matchCount} {regexResult.matchCount === 1 ? 'match' : 'matches'}
          </div>
        </div>
        <div className="relative flex-1 border border-border rounded-md bg-muted/30 overflow-hidden font-mono text-sm">
          <div className="absolute inset-0 p-3 whitespace-pre-wrap break-all pointer-events-none text-transparent">
            {renderHighlighted()}
          </div>
          <Textarea 
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Text to test against..."
            className="absolute inset-0 resize-none bg-transparent border-0 focus-visible:ring-0 text-foreground"
            style={{ color: 'transparent', caretColor: 'currentColor' }}
            spellCheck={false}
          />
        </div>
      </div>
      
      {regexResult.matches.length > 0 && (
        <div className="h-40 overflow-y-auto border border-border rounded-md bg-card p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">Match Groups</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const text = regexResult.matches
                  .map((m, i) => `Match ${i + 1}: ${m[0]}${m.length > 1 ? "\n  Groups: " + m.slice(1).join(", ") : ""}`)
                  .join("\n");
                navigator.clipboard.writeText(text);
                toast({ title: "Copied matches!", duration: 2000 });
              }}
              data-testid="button-copy-matches"
            >
              <Copy className="h-3 w-3 mr-1" /> Copy
            </Button>
          </div>
          <div className="space-y-2">
            {regexResult.matches.map((m, i) => (
              <div key={i} className="text-sm font-mono border-b border-border/50 pb-2 last:border-0">
                <div className="font-semibold text-primary">Match {i + 1}</div>
                {m.map((g: string, j: number) => (
                  <div key={j} className="flex gap-2 ml-4">
                    <span className="text-muted-foreground">Group {j}:</span>
                    <span>{g === undefined ? 'undefined' : g}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
