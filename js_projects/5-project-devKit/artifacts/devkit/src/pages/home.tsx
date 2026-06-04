import { Layout, TOOLS } from "@/components/layout";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-mono">DevKit_</h1>
        <p className="text-muted-foreground mt-2">A focused, distraction-free toolkit for developers.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TOOLS.map((tool) => (
          <Link key={tool.id} href={tool.path}>
            <div className="group border border-border bg-card p-4 rounded-lg cursor-pointer hover:border-primary transition-colors flex flex-col items-start gap-3 h-full">
              <div className="p-2 bg-primary/10 rounded-md text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <tool.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tool.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
