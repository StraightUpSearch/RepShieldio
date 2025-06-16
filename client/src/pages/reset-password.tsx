import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage('Invalid reset link. Please request a new password reset.');
      setIsError(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setIsError(false);

    // Validation
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage(data.message || 'Failed to reset password');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <p className="text-gray-600 mt-2">Enter your new password below</p>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert className={`mb-6 ${isError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                  <div className="flex items-center">
                    {isError ? (
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    )}
                    <AlertDescription className={isError ? 'text-red-700' : 'text-green-700'}>
                      {message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {!isSuccess && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading || !token}
                        className="pr-10"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading || !token}
                      placeholder="Confirm your new password"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !token}
                  >
                    {isLoading ? "Resetting Password..." : "Reset Password"}
                  </Button>
                </form>
              )}

              <div className="text-center mt-6">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/login')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
} 