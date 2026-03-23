import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Buy Tickets", path: "/buy-tickets" },
  { label: "Book Artist", path: "/book-artist" },
  { label: "Join Challenge", path: "/challenges" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="bg-nav text-nav-foreground sticky top-0 z-50">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="font-display font-bold text-lg flex items-center gap-1.5">
          <span className="text-primary">●</span> iticket
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm transition-colors ${
                location.pathname === link.path
                  ? "text-primary font-medium"
                  : "text-nav-foreground/70 hover:text-nav-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <Button size="sm" variant="outline" onClick={handleSignOut} className="rounded-full text-xs font-semibold px-5 gap-1 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
              <LogOut size={14} /> Sign Out
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold px-5 border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground">
                  Login
                </Button>
              </Link>
              <Link to="/create-account">
                <Button size="sm" className="rounded-full text-xs font-semibold px-5">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-nav-foreground/10"
          >
            <div className="container py-3 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`block py-2 text-sm ${
                    location.pathname === link.path ? "text-primary font-medium" : "text-nav-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Button size="sm" variant="outline" onClick={() => { setOpen(false); handleSignOut(); }} className="rounded-full text-xs font-semibold px-5 w-full mt-2 gap-1 border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground">
                  <LogOut size={14} /> Sign Out
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button size="sm" variant="outline" className="rounded-full text-xs font-semibold px-5 w-full mt-2 border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground">
                      Login
                    </Button>
                  </Link>
                  <Link to="/create-account" onClick={() => setOpen(false)}>
                    <Button size="sm" className="rounded-full text-xs font-semibold px-5 w-full mt-2">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
