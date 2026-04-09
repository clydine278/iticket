import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-nav text-nav-foreground pt-10 pb-6 mt-auto">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display font-bold text-lg mb-2">
              <span className="text-primary">●</span> iticket
            </p>
            <p className="text-nav-foreground/60 text-xs leading-relaxed mb-3">
              iticket is an event ticketing platform for memorable experiences. Sign up to receive information about upcoming events.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs mb-3 text-nav-foreground/80">Explore</h4>
            <ul className="space-y-2 text-xs text-nav-foreground/60">
              <li><Link to="/buy-tickets" className="hover:text-primary transition-colors">Buy Tickets</Link></li>
              <li><Link to="/book-artist" className="hover:text-primary transition-colors">Book an Artist</Link></li>
              <li><Link to="/challenges" className="hover:text-primary transition-colors">Join a Challenge</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs mb-3 text-nav-foreground/80">Company</h4>
            <ul className="space-y-2 text-xs text-nav-foreground/60">
              <li><Link to="/partnerships" className="hover:text-primary transition-colors">Partnerships</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs mb-3 text-nav-foreground/80">Quick Links</h4>
            <ul className="space-y-2 text-xs text-nav-foreground/60">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              {user ? (
                <>
                  <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                  <li><Link to="/dashboard/profile" className="hover:text-primary transition-colors">Profile</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
                  <li><Link to="/create-account" className="hover:text-primary transition-colors">Create Account</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-nav-foreground/10 pt-4 flex items-center justify-between">
          <Link to="/" className="font-display text-sm font-bold">
            <span className="text-primary">●</span> iticket
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs text-nav-foreground/60">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/buy-tickets" className="hover:text-primary transition-colors">Buy Tickets</Link>
            <Link to="/book-artist" className="hover:text-primary transition-colors">Book Artist</Link>
            <Link to="/challenges" className="hover:text-primary transition-colors">Join Challenge</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
