import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  Moon,
  Sun,
  Code,
  Braces,
  Hash,
  Key,
  FileJson,
  Clock,
  Palette,
  Type,
  Shield,
  Link as LinkIcon,
  FileText,
  Binary,
  GitCommit,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const TOOLS = [
  {
    id: "json",
    name: "JSON Formatter",
    icon: Braces,
    path: "/json",
    desc: "Format & validate JSON",
  },
  {
    id: "base64",
    name: "Base64",
    icon: Code,
    path: "/base64",
    desc: "Encode/Decode Base64",
  },
  {
    id: "url",
    name: "URL Encoder",
    icon: LinkIcon,
    path: "/url",
    desc: "Encode/Decode URLs",
  },
  {
    id: "hash",
    name: "Hash Generator",
    icon: Hash,
    path: "/hash",
    desc: "MD5, SHA-1, SHA-256",
  },
  {
    id: "uuid",
    name: "UUID",
    icon: Key,
    path: "/uuid",
    desc: "Generate UUIDs v4",
  },
  {
    id: "jwt",
    name: "JWT Decoder",
    icon: FileJson,
    path: "/jwt",
    desc: "Decode JWT tokens",
  },
  {
    id: "regex",
    name: "Regex",
    icon: Type,
    path: "/regex",
    desc: "Test regular expressions",
  },
  {
    id: "timestamp",
    name: "Timestamp",
    icon: Clock,
    path: "/timestamp",
    desc: "Epoch converter",
  },
  {
    id: "color",
    name: "Color Converter",
    icon: Palette,
    path: "/color",
    desc: "HEX, RGB, HSL",
  },
  {
    id: "diff",
    name: "Diff Viewer",
    icon: GitCommit,
    path: "/diff",
    desc: "Compare text",
  },
  {
    id: "lorem",
    name: "Lorem Ipsum",
    icon: FileText,
    path: "/lorem",
    desc: "Generate placeholder text",
  },
  {
    id: "password",
    name: "Password",
    icon: Shield,
    path: "/password",
    desc: "Generate secure passwords",
  },
  {
    id: "markdown",
    name: "Markdown",
    icon: FileText,
    path: "/markdown",
    desc: "Preview markdown",
  },
  {
    id: "base-converter",
    name: "Base Converter",
    icon: Binary,
    path: "/base-converter",
    desc: "Dec, Hex, Bin, Oct",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (location === "/") {
      const last = localStorage.getItem("devkit-last-tool");
      if (last && TOOLS.some((t) => t.path === last)) {
        setLocation(last);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("sidebar-search")?.focus();
      }
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        document.getElementById("sidebar-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredTools = TOOLS.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/">
            <h1 className="text-xl font-bold text-sidebar-primary mb-4 font-mono tracking-tight hover:cursor-pointer">
              DevKit_
            </h1>
          </Link>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-sidebar-foreground/50" />
            <Input
              id="sidebar-search"
              placeholder="Search tools... (Cmd+K)"
              className="pl-8 bg-background border-sidebar-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredTools.map((tool) => (
            <Link key={tool.id} href={tool.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  location === tool.path
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent text-sidebar-foreground"
                }`}
                onClick={() =>
                  localStorage.setItem("devkit-last-tool", tool.path)
                }
              >
                <tool.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tool.name}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:text-sidebar-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
      </div>
      <main className="flex-1 overflow-y-auto p-8 relative">{children}</main>
    </div>
  );
}

export { TOOLS };
