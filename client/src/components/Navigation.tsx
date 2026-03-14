import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@/context/UserContext";

function getInitials(name: string, fileName: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  }
  return fileName.charAt(0).toUpperCase();
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { profile, signOut } = useUser();
  const [, navigate] = useLocation();

  const menuItems = [
    { name: "Career", href: "/career" },
    { name: "Courses", href: "/courses" },
    { name: "Assessment", href: "/assessment" },
  ];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = () => {
    signOut();
    setProfileOpen(false);
    navigate("/");
  };

  const initials = profile
    ? getInitials(profile.sections.name, profile.fileName)
    : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-chart-1 to-chart-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
              Career-Pilot
            </span>
          </Link>

          {profile && (
            <>
              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-foreground/80 hover:text-foreground font-medium transition-colors duration-200"
                    data-testid={`link-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Profile avatar dropdown */}
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 hover-elevate rounded-full px-1 py-1 transition-colors"
                  data-testid="button-profile-menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{initials}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-md shadow-md z-50 py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      data-testid="link-profile"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      data-testid="button-sign-out-nav"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <Button
                size="icon"
                variant="ghost"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu (only shown when logged in and hamburger open) */}
        {profile && mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                data-testid={`link-mobile-${item.name.toLowerCase()}`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
            >
              My Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
