import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const LandingNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="fixed top-0 w-full z-50 backdrop-blur-xl bg-background/60 border-b border-border/30"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <span
          className="text-xl font-bold text-foreground tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Zyquence
        </span>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/mission" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Mission
          </Link>
          <a href="#platform" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Platform
          </a>
          <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Button size="sm" className="rounded-xl h-9 px-5 text-sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-sm h-9" asChild>
                <a href="/auth">Sign In</a>
              </Button>
              <Button size="sm" className="rounded-xl h-9 px-5 text-sm bg-foreground text-background hover:bg-foreground/90" asChild>
                <a href="/auth">Get Started</a>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default LandingNav;
