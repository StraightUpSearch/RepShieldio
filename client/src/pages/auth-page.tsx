import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, Users, BarChart3, CheckCircle, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FaGoogle } from "react-icons/fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ 
    email: "", 
    password: "", 
    firstName: "", 
    lastName: "" 
  });

  // Forgot password state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [isForgotPasswordSuccess, setIsForgotPasswordSuccess] = useState(false);

  // Redirect if already logged in - use useEffect to avoid setState during render
  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/my-account");
    }
  }, [isLoading, user, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: async () => {
      // Invalidate and refetch user query to get the new user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Small delay to ensure query has time to update
      setTimeout(() => {
        setLocation("/my-account");
      }, 100);
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      let errorMessage = "Login failed";
      
      if (error.message) {
        if (error.message.includes("Invalid email or password")) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes("401")) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes("400")) {
          errorMessage = "Please enter a valid email and password.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      // Invalidate and refetch user query to get the new user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Welcome to RepShield!",
        description: "Account created successfully. Redirecting to your dashboard...",
      });
      
      // Small delay to ensure query has time to update
      setTimeout(() => {
        setLocation("/my-account");
      }, 1500); // Longer delay so user can see the success message
    },
    onError: (error: Error) => {
      const errorMessage = error.message || "Registration failed";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      return data;
    },
    onSuccess: (data) => {
      setForgotPasswordMessage(data.message);
      setIsForgotPasswordSuccess(true);
    },
    onError: (error: Error) => {
      setForgotPasswordMessage(error.message || "Failed to send reset email");
      setIsForgotPasswordSuccess(false);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    setIsForgotPasswordSuccess(false);
    forgotPasswordMutation.mutate(forgotPasswordEmail);
  };

  const resetForgotPasswordModal = () => {
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setIsForgotPasswordSuccess(false);
    setIsForgotPasswordOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">RepShield</h1>
            <p className="text-gray-600 mt-2">Professional Reddit Reputation Management</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Sign in to access your reputation dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>

                  <div className="text-center mt-4">
                    <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                      <DialogTrigger asChild>
                        <Button variant="link" className="text-sm text-blue-600 hover:text-blue-800">
                          Forgot your password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Reset Password</DialogTitle>
                          <DialogDescription>
                            Enter your email address and we'll send you a link to reset your password.
                          </DialogDescription>
                        </DialogHeader>

                        {forgotPasswordMessage && (
                          <Alert className={`${isForgotPasswordSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <div className="flex items-center">
                              {isForgotPasswordSuccess ? (
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                              )}
                              <AlertDescription className={isForgotPasswordSuccess ? 'text-green-700' : 'text-red-700'}>
                                {forgotPasswordMessage}
                              </AlertDescription>
                            </div>
                          </Alert>
                        )}

                        {!isForgotPasswordSuccess && (
                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                              <Label htmlFor="forgot-email">Email</Label>
                              <Input
                                id="forgot-email"
                                type="email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                                disabled={forgotPasswordMutation.isPending}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                type="submit" 
                                className="flex-1"
                                disabled={forgotPasswordMutation.isPending}
                              >
                                {forgotPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={resetForgotPasswordModal}
                                disabled={forgotPasswordMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        )}

                        {isForgotPasswordSuccess && (
                          <div className="text-center">
                            <Button onClick={resetForgotPasswordModal} className="mt-4">
                              Close
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>
                    Start protecting your brand reputation today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstname">First Name</Label>
                        <Input
                          id="register-firstname"
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastname">Last Name</Label>
                        <Input
                          id="register-lastname"
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                        minLength={8}
                      />
                      {registerForm.password && (
                        <div className="text-sm space-y-1">
                          <div className={`flex items-center ${registerForm.password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                            {registerForm.password.length >= 8 ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                            At least 8 characters
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:flex flex-1 bg-blue-600 text-white p-12 items-center">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            Protect Your Brand Reputation on Reddit
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Professional content monitoring and removal services for businesses. 
            Monitor brand mentions, remove harmful content, and maintain your online reputation.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Real-time Monitoring</h3>
                <p className="text-blue-100">Track brand mentions across Reddit instantly</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Content Removal</h3>
                <p className="text-blue-100">Professional removal of harmful posts and comments</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Expert Support</h3>
                <p className="text-blue-100">Dedicated specialists handle your cases</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}