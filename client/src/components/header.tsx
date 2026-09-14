import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, LogOut, Settings, Ticket, DollarSign, Shield } from "lucide-react";
import { SiReddit } from "react-icons/si";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Route prefetch helpers — trigger lazy chunk loads on hover
const prefetchScan = () => { import("@/pages/scan"); };
const prefetchDashboard = () => { import("@/pages/dashboard"); };
const prefetchMyAccount = () => { import("@/pages/my-account"); };
const prefetchBlog = () => { import("@/pages/blog"); };
const prefetchPricing = () => { import("@/pages/pricing"); };

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on Escape and trap focus within menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuToggleRef.current?.focus();
        return;
      }

      // Basic focus trapping within the mobile menu
      if (e.key === 'Tab' && mobileMenuRef.current) {
        const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      await apiRequest("POST", "/api/logout");
      queryClient.clear();
      setLocation("/");
    } catch (error) {
      console.error("Logout error:", error);
      queryClient.clear();
      setLocation("/");
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-shadow duration-200 ${isScrolled ? 'shadow-md' : ''}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-orange-600 focus:font-semibold focus:rounded focus:shadow-lg focus:outline-2 focus:outline-orange-500"
      >
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gray-950 rounded-lg flex items-center justify-center">
              <SiReddit className="text-orange-500 text-xl" />
            </div>
            <span className="font-satoshi text-xl font-black tracking-[-0.03em] text-gray-950">RepShield</span>
          </Link>
          
          <nav aria-label="Main navigation" className="hidden md:flex items-center space-x-6">
            <Link href="/scan" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5 text-sm font-medium" onMouseEnter={prefetchScan}>
              <Search className="h-4 w-4" />
              Free Brand Scan
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5 text-sm font-medium" onMouseEnter={prefetchPricing}>
              <DollarSign className="h-4 w-4" />
              Pricing
            </Link>
            <Link href="/monitoring" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5 text-sm font-medium">
              <Shield className="h-4 w-4" />
              Monitoring
            </Link>
            <Link href="/ticket-status" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5 text-sm font-medium">
              <Ticket className="h-4 w-4" />
              Check Status
            </Link>
            <Button
              asChild
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
            >
              <Link href="/contact">Get a quote</Link>
            </Button>
            
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-2 flex items-center gap-2" onMouseEnter={prefetchMyAccount}>
                        <User className="h-4 w-4" />
                        {(user as any)?.role === 'admin' ? (
                          <span className="text-orange-500 font-semibold">Admin</span>
                        ) : (
                          <span>{(user as any)?.firstName || (user as any)?.email?.split('@')[0] || 'User'}</span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/my-account" className="flex items-center gap-2 w-full">
                          <User className="h-4 w-4" />
                          My Account
                        </Link>
                      </DropdownMenuItem>
                      {(user as any)?.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="flex items-center gap-2 w-full text-orange-600">
                              <Ticket className="h-4 w-4" />
                              Manage Tickets
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/admin-dashboard" className="flex items-center gap-2 w-full text-orange-500">
                              <Settings className="h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="outline"
                    asChild
                    className="ml-2"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                )}
              </>
            )}
          </nav>
          
          <div className="md:hidden">
            <Button
              ref={menuToggleRef}
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div ref={mobileMenuRef} id="mobile-menu" role="dialog" aria-label="Navigation menu" className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
            <nav aria-label="Mobile navigation" className="flex flex-col space-y-4 p-4">
              <Link href="/scan" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2" onMouseEnter={prefetchScan} onClick={() => setIsMenuOpen(false)}>
                <Search className="h-4 w-4" />
                Free Brand Scan
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2" onMouseEnter={prefetchPricing} onClick={() => setIsMenuOpen(false)}>
                <DollarSign className="h-4 w-4" />
                Pricing
              </Link>
              <Link href="/monitoring" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <Shield className="h-4 w-4" />
                Monitoring
              </Link>
              <Link href="/ticket-status" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <Ticket className="h-4 w-4" />
                Check Status
              </Link>
              <Button
                asChild
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg w-full"
              >
                <Link href="/contact" onClick={() => setIsMenuOpen(false)}>Get a quote</Link>
              </Button>

              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <Link href="/my-account" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2" onMouseEnter={prefetchMyAccount} onClick={() => setIsMenuOpen(false)}>
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      {(user as any)?.role === 'admin' && (
                        <Link href="/admin-dashboard" className="text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                          <Settings className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-2 w-full"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-gray-100 pt-4">
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                      </Button>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
