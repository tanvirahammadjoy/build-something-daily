import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function MarkdownPreviewer() {
  const [input, setInput] = useState("# Hello World\n\nThis is a **Markdown** previewer.\n\n- Write on the left\n- See HTML on the right\n\n```js\nconsole.log('Code block');\n```");
  const { toast } = useToast();

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(input);
    toast({ title: "Copied Raw Markdown!", duration: 2000 });
  };

  const rawHtml = marked.parse(input) as string;
  const html = DOMPurify.sanitize(rawHtml);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(html);
    toast({ title: "Copied HTML!", duration: 2000 });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-mono">Markdown Previewer</h1>
          <p className="text-muted-foreground text-sm">Write markdown and see it rendered live.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleCopyRaw}>Copy Raw</Button>
          <Button onClick={handleCopyHtml}>Copy HTML</Button>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-2 gap-4 min-h-0">
        <Textarea 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono h-full resize-none border-border"
          placeholder="Type markdown here..."
        />
        <div className="border border-border bg-card rounded-md overflow-auto p-6">
          <div 
            className="prose dark:prose-invert prose-sm sm:prose-base max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
