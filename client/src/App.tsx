import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SchemaOrg } from "@/components/schema-org";
import SEOHead from "@/components/seo-head";
import AdvancedSEO from "@/components/advanced-seo";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/loading-spinner";

// Core pages - loaded immediately for fast initial experience
import HomeServiceFirst from "@/pages/home-service-first";
import AuthPage from "@/pages/auth-page";
import Contact from "@/pages/contact";

// Secondary pages - lazy loaded to reduce bundle size
const Home = lazy(() => import("@/pages/home"));
const HomeRedesigned = lazy(() => import("@/pages/home-redesigned"));
const Scan = lazy(() => import("@/pages/scan"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const MyAccount = lazy(() => import("@/pages/my-account"));
const About = lazy(() => import("@/pages/about"));
const TicketStatusPage = lazy(() => import("@/pages/ticket-status"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const LegalCompliance = lazy(() => import("@/pages/legal-compliance"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));

// Admin pages - lazy loaded to reduce main bundle size significantly
const AdminPanel = lazy(() => import("@/pages/admin"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const DataAdmin = lazy(() => import("@/pages/data-admin"));

function Router() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    }>
      <Switch>
        {/* Core pages - no suspense needed as they're not lazy loaded */}
        <Route path="/" component={HomeServiceFirst} />
        <Route path="/login" component={AuthPage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/contact" component={Contact} />
        
        {/* Secondary pages - lazy loaded */}
        <Route path="/old" component={Home} />
        <Route path="/redesign" component={HomeRedesigned} />
        <Route path="/scan" component={Scan} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/my-account" component={MyAccount} />
        <Route path="/about" component={About} />
        <Route path="/ticket-status" component={TicketStatusPage} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/legal-compliance" component={LegalCompliance} />
        <Route path="/reset-password" component={ResetPassword} />
        
        {/* Admin pages - lazy loaded to keep main bundle small */}
        <Route path="/admin" component={AdminPanel} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/data-admin" component={DataAdmin} />
        
        <Route>
          <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600">The page you're looking for doesn't exist.</p>
            </div>
          </div>
        </Route>
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
