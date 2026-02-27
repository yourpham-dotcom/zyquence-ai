const LandingFooter = () => {
  return (
    <footer className="relative border-t border-foreground/[0.05] px-6 md:px-16 lg:px-24 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span
            className="text-sm font-bold text-foreground tracking-tight block mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Zyquence
          </span>
          <span className="text-xs text-foreground/20">The Intelligence Platform</span>
        </div>

        <div className="flex flex-wrap gap-8">
          <a href="/mission" className="text-xs text-foreground/25 hover:text-foreground/60 transition-colors duration-300">Mission</a>
          <a href="/pricing" className="text-xs text-foreground/25 hover:text-foreground/60 transition-colors duration-300">Pricing</a>
          <a href="/privacy" className="text-xs text-foreground/25 hover:text-foreground/60 transition-colors duration-300">Privacy</a>
        </div>

        <span className="text-xs text-foreground/15 font-mono">©2025 Zyquence</span>
      </div>
    </footer>
  );
};

export default LandingFooter;
