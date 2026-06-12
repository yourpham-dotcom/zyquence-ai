import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

const LandingNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-foreground/[0.06]"
    >
      <div className="flex items-center justify-between px-6 md:px-12 h-14">
        <span
          className="text-sm font-semibold text-foreground tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Zyquence
        </span>

        <div className="hidden md:flex items-center gap-12">
          <Link to="/mission" className="text-xs text-foreground/40 hover:text-foreground transition-colors">
            Mission
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs font-medium text-foreground/60 hover:text-foreground transition-colors"
            >
              Dashboard
            </button>
          ) : (
            <>
              <a href="/auth" className="text-xs text-foreground/40 hover:text-foreground transition-colors hidden sm:block">
                Sign In
              </a>
              <a
                href="/auth"
                className="text-xs font-medium px-4 py-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors"
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
