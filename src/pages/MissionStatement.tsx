const MissionStatement = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-gradient">Mission Statement</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Zyquence is an ecosystem engine aimed at enabling individuals to take control of their future by providing smart tools that assist them to develop, innovate, and excel in all aspects of life.
        </p>
        <a href="/" className="inline-block text-sm text-muted-foreground hover:text-foreground transition-colors mt-4">
          ← Back to home
        </a>
      </div>
    </div>
  );
};

export default MissionStatement;
