import { Link } from "react-router-dom";
import { Shield, LogIn, UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[140px] animate-glow-pulse" />
      </div>

      <div className="relative z-10 max-w-lg text-center animate-fade-in">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-primary">
          <Shield className="h-8 w-8 text-primary" />
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Auth<span className="text-primary">System</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base text-muted-foreground">
          Secure authentication with JWT tokens, password hashing, and protected routes.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {isAuthenticated ? (
            <Button asChild size="lg" className="glow-primary gap-2">
              <Link to="/profile">
                Go to Profile <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="glow-primary gap-2">
                <Link to="/login">
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 border-border/50">
                <Link to="/register">
                  <UserPlus className="h-4 w-4" /> Create account
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Feature badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {["JWT Auth", "bcrypt Hashing", "Protected Routes", "Profile Management"].map(
            (feature) => (
              <span
                key={feature}
                className="rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground"
              >
                {feature}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
