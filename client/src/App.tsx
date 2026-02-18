import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SchemaOrg } from "@/components/schema-org";
import SEOHead from "@/components/seo-head";
import AdvancedSEO from "@/components/advanced-seo";
import Home from "@/pages/home";
import HomeRedesigned from "@/pages/home-redesigned";
import HomeServiceFirst from "@/pages/home-service-first";
import Scan from "@/pages/scan";
import Dashboard from "@/pages/dashboard";
import AdminPanel from "@/pages/admin";
import MyAccount from "@/pages/my-account";
import AdminDashboard from "@/pages/admin-dashboard";
import DataAdmin from "@/pages/data-admin";
import AuthPage from "@/pages/auth-page";
import About from "@/pages/about";
import TicketStatusPage from "@/pages/ticket-status";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import LegalCompliance from "@/pages/legal-compliance";
import Contact from "@/pages/contact";
import Blog from "@/pages/blog";
import Monitoring from "@/pages/monitoring";
import ResetPassword from "@/pages/reset-password";

function Router() {
  return (
          <Switch>
        <Route path="/" component={HomeServiceFirst} />
        <Route path="/old" component={Home} />
        <Route path="/redesign" component={HomeRedesigned} />
        <Route path="/scan" component={Scan} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/my-account" component={MyAccount} />
      <Route path="/about" component={About} />
      <Route path="/ticket-status" component={TicketStatusPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/data-admin" component={DataAdmin} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/legal-compliance" component={LegalCompliance} />
      <Route path="/contact" component={Contact} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={Blog} />
      <Route path="/monitoring" component={Monitoring} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route>
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600">The page you're looking for doesn't exist.</p>
          </div>
        </div>
      </Route>
    </Switch>
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
