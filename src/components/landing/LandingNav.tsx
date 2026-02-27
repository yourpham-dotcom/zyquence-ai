import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const LandingNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1 }}
      className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-2xl border-b border-foreground/[0.05]"
    >
      <div className="flex items-center justify-between px-6 md:px-16 lg:px-24 h-16">
        <Link
          to="/"
          className="text-sm font-bold text-foreground tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Zyquence
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/mission" className="text-xs text-foreground/35 hover:text-foreground/70 transition-colors duration-300">
            Mission
          </Link>
          <Link to="/pricing" className="text-xs text-foreground/35 hover:text-foreground/70 transition-colors duration-300">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs font-medium px-5 py-2 rounded-full bg-foreground/10 text-foreground/80 hover:bg-foreground/15 transition-all duration-300"
            >
              Dashboard
            </button>
          ) : (
            <>
              <a href="/auth" className="text-xs text-foreground/35 hover:text-foreground/70 transition-colors duration-300 hidden sm:block">
                Sign In
              </a>
              <a
                href="/auth"
                className="text-xs font-semibold px-5 py-2 rounded-full bg-gradient-to-r from-[hsl(210_80%_55%)] to-[hsl(200_75%_50%)] text-white hover:shadow-[0_0_20px_hsl(210_80%_55%/0.3)] transition-all duration-300"
              >
                Get Started
              </a>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default LandingNav;
