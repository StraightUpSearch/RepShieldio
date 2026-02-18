import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, LogOut, Settings, Ticket } from "lucide-react";
import { SiReddit } from "react-icons/si";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 gradient-navy rounded-lg flex items-center justify-center">
              <SiReddit className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-navy-deep">RepShield</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/scan" className="text-gray-700 hover:text-navy-deep transition-colors flex items-center gap-2">
              <Search className="h-4 w-4" />
              Live Scanner
            </Link>
            <Link href="/ticket-status" className="text-gray-700 hover:text-navy-deep transition-colors flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Check Status
            </Link>
            <Button 
              asChild
              className="bg-reddit-orange text-white hover:bg-red-600 transition-colors font-medium"
            >
              <Link href="/contact">Free Audit</Link>
            </Button>
            
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {(user as any)?.role === 'admin' ? (
                          <span className="text-blue-600 font-semibold">Admin</span>
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
                            <Link href="/admin-dashboard" className="flex items-center gap-2 w-full text-blue-600">
                              <Settings className="h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={async () => {
                        try {
                          await apiRequest("POST", "/api/logout");
                          window.location.href = "/";
                        } catch (error) {
                          console.error("Logout error:", error);
                          window.location.href = "/";
                        }
                      }} className="flex items-center gap-2">
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
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
            <nav className="flex flex-col space-y-4 p-4">
              <Link href="/scan" className="text-gray-700 hover:text-navy-deep transition-colors flex items-center gap-2">
                <Search className="h-4 w-4" />
                Live Scanner
              </Link>
              <Link href="/ticket-status" className="text-gray-700 hover:text-navy-deep transition-colors flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Check Status
              </Link>
              <Button 
                asChild
                className="bg-reddit-orange text-white hover:bg-red-600 transition-colors font-medium w-full"
              >
                <Link href="/contact">Free Audit</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
