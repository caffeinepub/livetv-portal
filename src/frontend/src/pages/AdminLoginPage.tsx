import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, Lock, Tv, User } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { useAdminLogin } from "../hooks/useQueries";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { mutateAsync: adminLogin, isPending } = useAdminLogin();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const token = await adminLogin({ username, password });
      if (token) {
        localStorage.setItem("adminToken", token);
        navigate({ to: "/admin" });
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center px-4">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.62_0.22_27/0.05),transparent_70%)]" />

      <motion.div
        className="w-full max-w-sm relative"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-tv-red rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_24px_oklch(0.62_0.22_27/0.4)]">
            <Tv className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            JagoBD Admin
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to manage your channels
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card border border-tv-border rounded-xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-sm text-muted-foreground"
              >
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 bg-input border-tv-border focus:border-tv-red focus:ring-tv-red"
                  required
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm text-muted-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-input border-tv-border focus:border-tv-red focus:ring-tv-red"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-tv-red hover:bg-tv-red-bright text-white font-semibold mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-4">
          <Link to="/" className="hover:text-tv-red transition-colors">
            ← Back to JagoBD
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
