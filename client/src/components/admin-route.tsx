import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { LoadingSpinner } from "@/components/loading-spinner";

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not logged in - redirect to auth page
        setLocation("/auth");
        return;
      }
      
      if (!user || (user as any)?.email !== "jamie@straightupsearch.com") {
        // Not the admin user - redirect to home
        setLocation("/");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner size="lg" text="Verifying admin access..." />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <LoadingSpinner size="lg" text="Redirecting to login..." />;
  }

  // Not admin user
  if (!user || (user as any)?.email !== "jamie@straightupsearch.com") {
    return <LoadingSpinner size="lg" text="Access denied. Redirecting..." />;
  }

  // User is authenticated admin
  return <>{children}</>;
}