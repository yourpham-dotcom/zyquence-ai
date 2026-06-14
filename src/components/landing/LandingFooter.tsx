const LandingFooter = () => {
  return (
    <footer className="bg-background border-t border-foreground/[0.06] px-6 md:px-12 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <span
          className="text-sm font-semibold text-foreground tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Zyquence
        </span>

        <div className="flex flex-wrap gap-8">
          <a href="/mission" className="text-xs text-foreground/30 hover:text-foreground transition-colors">Mission</a>
<a href="/privacy" className="text-xs text-foreground/30 hover:text-foreground transition-colors">Privacy</a>
          <a href="mailto:zyquence.info@gmail.com" className="text-xs text-foreground/30 hover:text-foreground transition-colors">Contact</a>
        </div>

        <span className="text-xs text-foreground/15 font-mono">©2025</span>
      </div>
    </footer>
  );
};

export default LandingFooter;
