import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="default" className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Free Brand Scan
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
