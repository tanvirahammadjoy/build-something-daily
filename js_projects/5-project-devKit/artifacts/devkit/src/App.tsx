import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

import Home from "@/pages/home";
import JsonFormatter from "@/pages/json";
import Base64 from "@/pages/base64";
import UrlEncoder from "@/pages/url";
import HashGenerator from "@/pages/hash";
import UuidGenerator from "@/pages/uuid";
import JwtDecoder from "@/pages/jwt";
import RegexTester from "@/pages/regex";
import TimestampConverter from "@/pages/timestamp";
import ColorConverter from "@/pages/color";
import DiffViewer from "@/pages/diff";
import LoremIpsum from "@/pages/lorem";
import PasswordGenerator from "@/pages/password";
import MarkdownPreviewer from "@/pages/markdown";
import BaseConverter from "@/pages/base-converter";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/json" component={JsonFormatter} />
        <Route path="/base64" component={Base64} />
        <Route path="/url" component={UrlEncoder} />
        <Route path="/hash" component={HashGenerator} />
        <Route path="/uuid" component={UuidGenerator} />
        <Route path="/jwt" component={JwtDecoder} />
        <Route path="/regex" component={RegexTester} />
        <Route path="/timestamp" component={TimestampConverter} />
        <Route path="/color" component={ColorConverter} />
        <Route path="/diff" component={DiffViewer} />
        <Route path="/lorem" component={LoremIpsum} />
        <Route path="/password" component={PasswordGenerator} />
        <Route path="/markdown" component={MarkdownPreviewer} />
        <Route path="/base-converter" component={BaseConverter} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
