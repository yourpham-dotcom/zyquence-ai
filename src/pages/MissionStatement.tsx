import { Link } from "react-router-dom";

const MissionStatement = () => {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <Link to="/" className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
        ← Back to home
      </Link>
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-gradient">Mission Statement</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Zyquence is an ecosystem engine aimed at enabling individuals to take control of their future by providing smart tools that assist them to develop, innovate, and excel in all aspects of life.
        </p>
      </div>
    </div>
  );
};

export default MissionStatement;
