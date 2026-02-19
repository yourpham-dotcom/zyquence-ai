import { Link } from "react-router-dom";

const Mission = () => {
  return (
    <section id="mission" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--cyber-green)/0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <Link to="/mission" className="block text-center space-y-4 group">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-gradient">Our Mission</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto group-hover:text-foreground transition-colors">
              Empowering everyone to unlock their creative potential and develop real skills
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Mission;
