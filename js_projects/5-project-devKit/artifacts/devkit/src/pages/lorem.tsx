import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", 
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", 
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", 
  "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat",
  "duis", "aute", "irure", "dolor", "in", "reprehenderit", "voluptate", "velit", "esse",
  "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat",
  "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

function generateParagraphs(count: number, startWithLorem: boolean) {
  const paras = [];
  for (let i = 0; i < count; i++) {
    const sentences = Math.floor(Math.random() * 4) + 4;
    paras.push(generateSentences(sentences, i === 0 && startWithLorem).join(" "));
  }
  return paras;
}

function generateSentences(count: number, startWithLorem: boolean) {
  const sents = [];
  for (let i = 0; i < count; i++) {
    const wordCount = Math.floor(Math.random() * 10) + 6;
    let sent = generateWords(wordCount, i === 0 && startWithLorem).join(" ");
    sent = sent.charAt(0).toUpperCase() + sent.slice(1) + ".";
    sents.push(sent);
  }
  return sents;
}

function generateWords(count: number, startWithLorem: boolean) {
  const words = [];
  if (startWithLorem && count >= 5) {
    words.push("lorem", "ipsum", "dolor", "sit", "amet");
    count -= 5;
  }
  for (let i = 0; i < count; i++) {
    words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return words;
}

export default function LoremIpsum() {
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [startLorem, setStartLorem] = useState(true);
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const handleGenerate = () => {
    let result = "";
    if (type === "paragraphs") {
      result = generateParagraphs(count, startLorem).join("\n\n");
    } else if (type === "sentences") {
      result = generateSentences(count, startLorem).join(" ");
    } else {
      result = generateWords(count, startLorem).join(" ");
      result = result.charAt(0).toUpperCase() + result.slice(1) + ".";
    }
    setOutput(result);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", duration: 2000 });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-2xl font-bold font-mono">Lorem Ipsum</h1>
        <p className="text-muted-foreground text-sm">Generate placeholder text.</p>
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v: any) => setType(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraphs">Paragraphs</SelectItem>
              <SelectItem value="sentences">Sentences</SelectItem>
              <SelectItem value="words">Words</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Count</Label>
          <Input 
            type="number" 
            min={1} 
            max={100}
            value={count} 
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="w-[100px]"
          />
        </div>

        <div className="space-y-2 flex items-center gap-2 pb-2">
          <Switch id="start-lorem" checked={startLorem} onCheckedChange={setStartLorem} />
          <Label htmlFor="start-lorem" className="cursor-pointer mb-0">Start with "Lorem ipsum"</Label>
        </div>

        <div className="flex-1"></div>

        <Button onClick={handleGenerate}>Generate</Button>
      </div>

      <div className="relative flex-1 bg-muted/30 border border-border rounded-lg p-6 overflow-auto">
        <div className="whitespace-pre-wrap text-base leading-relaxed">{output}</div>
        {output && (
          <Button size="sm" variant="secondary" className="absolute top-4 right-4" onClick={handleCopy}>
            Copy
          </Button>
        )}
      </div>
    </div>
  );
}
