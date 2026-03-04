import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";
import { Database, Activity, ExternalLink, ScrollText, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", icon: Database, page: "Dashboard" },
  { name: "Training", icon: Activity, page: "Training" },
  { name: "External", icon: ExternalLink, page: "ExternalTraining" },
  { name: "Audit Log", icon: ScrollText, page: "AuditLog" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (currentPageName === "PageNotFound") return children;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <style>{`
        :root {
          --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
        }
        body { font-family: var(--font-sans); }
      `}</style>

      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 tracking-tight hidden sm:block">DataShield</span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link key={item.page} to={createPageUrl(item.page)}>
                    <button
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-slate-100 text-slate-800"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </button>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMobileOpen(false)}>
                  <button
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                      isActive ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
