import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SchemaOrg } from "@/components/schema-org";
import SEOHead from "@/components/seo-head";
import AdvancedSEO from "@/components/advanced-seo";
import { ErrorBoundary } from "@/components/error-boundary";

// Static imports - lightweight pages needed on first paint
import HomeServiceFirst from "@/pages/home-service-first";
import AuthPage from "@/pages/auth-page";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import NotFound from "@/pages/not-found";

// Lazy-loaded imports - heavier pages split into separate chunks
const Scan = lazy(() => import("@/pages/scan"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const AdminPanel = lazy(() => import("@/pages/admin"));
const MyAccount = lazy(() => import("@/pages/my-account"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const DataAdmin = lazy(() => import("@/pages/data-admin"));
const TicketStatusPage = lazy(() => import("@/pages/ticket-status"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const LegalCompliance = lazy(() => import("@/pages/legal-compliance"));
const Blog = lazy(() => import("@/pages/blog"));
const Monitoring = lazy(() => import("@/pages/monitoring"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));

const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<LazyFallback />}>
      <Switch>
        {/* Static routes - no code splitting needed */}
        <Route path="/" component={HomeServiceFirst} />
        <Route path="/about" component={About} />
        <Route path="/login" component={AuthPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/contact" component={Contact} />

        {/* Lazy-loaded routes - separate chunks */}
        <Route path="/scan" component={Scan} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/my-account" component={MyAccount} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/data-admin" component={DataAdmin} />
        <Route path="/ticket-status" component={TicketStatusPage} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/legal-compliance" component={LegalCompliance} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={Blog} />
        <Route path="/monitoring" component={Monitoring} />
        <Route path="/reset-password" component={ResetPassword} />

        {/* Fallback */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SchemaOrg />
        <SEOHead />
        <AdvancedSEO />
        <Toaster />
        <ErrorBoundary>
          <main id="main-content">
            <Router />
          </main>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
