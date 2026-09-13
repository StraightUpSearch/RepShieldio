import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { SiReddit } from "react-icons/si";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (!isLoading && user) setLocation("/my-account");
  }, [isLoading, user, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setTimeout(() => setLocation("/my-account"), 100);
    },
    onError: (error: any) => {
      toast({
        title: "Sign in failed",
        description: error.message?.includes("Invalid") ? "Wrong email or password." : "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: async () => {
      await loginMutation.mutateAsync({ email: registerForm.email, password: registerForm.password });
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const forgotMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to send reset link");
      return res.json();
    },
    onSuccess: () => setForgotSent(true),
    onError: () => {
      toast({ title: "Error", description: "Failed to send reset link.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white max-w-xl">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 mb-12">
          <SiReddit className="w-6 h-6 text-orange-500" />
          <span className="font-satoshi font-black text-xl tracking-[-0.03em] text-gray-950">RepShield</span>
        </a>

        {mode === "login" && (
          <>
            <div className="mb-8">
              <h1 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-2">
                Welcome back
              </h1>
              <p className="text-gray-500">Sign in to your account to track your cases.</p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(loginForm); }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  className="mt-1 h-11"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</Label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  className="mt-1 h-11"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-11 bg-gray-950 hover:bg-gray-800 text-white font-semibold"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Sign in <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
              No account?{" "}
              <button onClick={() => setMode("register")} className="text-gray-950 font-semibold hover:underline">
                Create one free
              </button>
            </p>
          </>
        )}

        {mode === "register" && (
          <>
            <div className="mb-8">
              <h1 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-2">
                Create account
              </h1>
              <p className="text-gray-500">Track your cases and manage your removals in one place.</p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); registerMutation.mutate(registerForm); }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="reg-first" className="text-sm font-medium text-gray-700">First name</Label>
                  <Input
                    id="reg-first"
                    className="mt-1 h-11"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-last" className="text-sm font-medium text-gray-700">Last name</Label>
                  <Input
                    id="reg-last"
                    className="mt-1 h-11"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  className="mt-1 h-11"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  className="mt-1 h-11"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
              </div>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full h-11 bg-gray-950 hover:bg-gray-800 text-white font-semibold"
              >
                {registerMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Create account <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-gray-950 font-semibold hover:underline">
                Sign in
              </button>
            </p>
          </>
        )}

        {mode === "forgot" && (
          <>
            <div className="mb-8">
              <h1 className="font-satoshi text-3xl font-black text-gray-950 tracking-[-0.03em] mb-2">
                Reset password
              </h1>
              <p className="text-gray-500">We'll email you a link to set a new password.</p>
            </div>

            {forgotSent ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 text-sm text-gray-600">
                  Reset link sent. Check your inbox (and spam folder).
                </div>
                <button onClick={() => { setMode("login"); setForgotSent(false); }} className="text-sm text-gray-500 hover:text-gray-900">
                  Back to sign in
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); forgotMutation.mutate(forgotEmail); }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    className="mt-1 h-11"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={forgotMutation.isPending}
                  className="w-full h-11 bg-gray-950 hover:bg-gray-800 text-white font-semibold"
                >
                  {forgotMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send reset link"}
                </Button>
                <button type="button" onClick={() => setMode("login")} className="text-sm text-gray-400 hover:text-gray-700">
                  Back to sign in
                </button>
              </form>
            )}
          </>
        )}
      </div>

      {/* Right: dark proof panel */}
      <div className="hidden lg:flex flex-1 bg-gray-950 text-white flex-col justify-between p-16">
        <div />
        <div className="space-y-10 max-w-md">
          <blockquote>
            <p className="font-satoshi text-2xl font-black tracking-[-0.02em] leading-snug text-white mb-6">
              "RepShield removed a 2,400-upvote defamatory thread in 36 hours. Our inbound pipeline recovered the same week."
            </p>
            <footer className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-white/60">SC</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Sarah C.</div>
                <div className="text-xs text-white/40">Founder & CEO, SaaS Company</div>
              </div>
            </footer>
          </blockquote>

          <div className="grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden">
            {[
              { v: "1,650+", l: "Cases resolved" },
              { v: "95%", l: "Success rate" },
              { v: "36 hrs", l: "Avg removal" },
            ].map((s) => (
              <div key={s.l} className="bg-gray-950 px-5 py-5">
                <div className="font-satoshi text-2xl font-black text-white tracking-[-0.03em]">{s.v}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-white/20">© {new Date().getFullYear()} RepShield. All rights reserved.</div>
      </div>
    </div>
  );
}
