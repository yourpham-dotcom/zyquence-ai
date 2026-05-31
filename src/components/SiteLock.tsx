import { useState, useEffect, FormEvent } from "react";
import { Lock } from "lucide-react";

const SITE_PASSWORD = "zyquence2020";
const STORAGE_KEY = "zyquence_site_unlocked";

const AUTHORIZED_USERS: Record<string, string> = {
  "yourpham@gmail.com": "george14",
};

interface SiteLockProps {
  children: React.ReactNode;
}

const SiteLock = ({ children }: SiteLockProps) => {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "true") {
      setUnlocked(true);
    }
    setChecked(true);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      const trimmedEmail = email.trim().toLowerCase();
      const masterMatch = !trimmedEmail && password === SITE_PASSWORD;
      const userMatch = trimmedEmail && AUTHORIZED_USERS[trimmedEmail] === password;
      if (masterMatch || userMatch) {
        sessionStorage.setItem(STORAGE_KEY, "true");
        setUnlocked(true);
        setError("");
      } else {
        setError("ACCESS DENIED — Invalid credentials");
        setPassword("");
      }
      setIsAuthenticating(false);
    }, 700);
  };

  if (!checked) return null;
  if (unlocked) return <>{children}</>;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#030a0a" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,200,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,200,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Center radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,200,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Corner brackets */}
        <div className="absolute -top-3 -left-3 w-7 h-7 border-t-2 border-l-2 border-cyan-400/70" />
        <div className="absolute -top-3 -right-3 w-7 h-7 border-t-2 border-r-2 border-cyan-400/70" />
        <div className="absolute -bottom-3 -left-3 w-7 h-7 border-b-2 border-l-2 border-cyan-400/70" />
        <div className="absolute -bottom-3 -right-3 w-7 h-7 border-b-2 border-r-2 border-cyan-400/70" />

        {/* Panel */}
        <div
          className="border border-cyan-900/60 bg-black/80 backdrop-blur-sm p-8 space-y-6"
          style={{
            boxShadow:
              "0 0 60px rgba(0,255,200,0.06), inset 0 0 60px rgba(0,255,200,0.02)",
          }}
        >
          {/* Status bar */}
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-700 border-b border-cyan-900/40 pb-3 tracking-wider">
            <span>SYS://ZYQUENCE.AUTH</span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-red-500"
                style={{ animation: "pulse 1.5s ease-in-out infinite" }}
              />
              LOCKED
            </span>
          </div>

          {/* Icon + title */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div
                className="w-14 h-14 border border-cyan-500/40 rotate-45 flex items-center justify-center"
                style={{ boxShadow: "0 0 24px rgba(0,255,200,0.18)" }}
              >
                <Lock className="h-6 w-6 text-cyan-400 -rotate-45" />
              </div>
              <div
                className="absolute w-14 h-14 border border-cyan-400/15 rotate-45"
                style={{ animation: "ping 3s ease-in-out infinite" }}
              />
            </div>

            <div>
              <h1
                className="text-2xl font-bold tracking-[0.25em] text-white font-mono uppercase"
                style={{ textShadow: "0 0 20px rgba(0,255,200,0.3)" }}
              >
                ZYQUENCE
              </h1>
              <p className="text-[10px] text-cyan-600 font-mono tracking-[0.4em] mt-1 uppercase">
                Access Terminal
              </p>
            </div>

            <p className="text-[11px] text-cyan-800 font-mono leading-relaxed">
              &gt; RESTRICTED SYSTEM. AUTHENTICATION REQUIRED.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-cyan-600 tracking-[0.2em] uppercase block">
                Identifier{" "}
                <span className="text-cyan-900">[optional]</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700 font-mono text-sm select-none">
                  $
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@domain.com"
                  autoFocus
                  className="w-full bg-black/70 border border-cyan-900/50 text-cyan-300 placeholder-cyan-900 text-sm pl-7 pr-3 py-2.5 outline-none font-mono transition-all"
                  style={{
                    boxShadow: "none",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(0,255,200,0.1)")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-cyan-600 tracking-[0.2em] uppercase block">
                Auth Key
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-700 font-mono text-sm select-none">
                  $
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="············"
                  className="w-full bg-black/70 border border-cyan-900/50 text-cyan-300 placeholder-cyan-800 text-sm pl-7 pr-3 py-2.5 outline-none font-mono transition-all"
                  style={{ boxShadow: "none" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(0,255,200,0.1)")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>
              {error && (
                <p className="text-[11px] text-red-500 font-mono flex items-center gap-1.5 tracking-wide">
                  <span className="text-red-400">!</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full border border-cyan-700/50 text-cyan-400 text-sm font-mono tracking-[0.25em] uppercase py-3 transition-all disabled:opacity-40 cursor-pointer"
              style={{
                background: "rgba(0,40,35,0.4)",
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,60,50,0.5)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(0,255,200,0.12)";
                e.currentTarget.style.borderColor = "rgba(0,255,200,0.5)";
                e.currentTarget.style.color = "#a0fff0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,40,35,0.4)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "rgba(0,255,200,0.3)";
                e.currentTarget.style.color = "#22d3ee";
              }}
            >
              {isAuthenticating ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-1 h-4 bg-cyan-400 inline-block"
                    style={{ animation: "pulse 0.6s ease-in-out infinite" }}
                  />
                  AUTHENTICATING...
                </span>
              ) : (
                "[ AUTHENTICATE ]"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="flex justify-between text-[10px] font-mono text-cyan-900 border-t border-cyan-900/30 pt-3 tracking-wider">
            <span>v2.4.1</span>
            <span>ZYQUENCE SYSTEMS</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ping {
          0% { transform: rotate(45deg) scale(1); opacity: 0.4; }
          70% { transform: rotate(45deg) scale(1.6); opacity: 0; }
          100% { transform: rotate(45deg) scale(1.6); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default SiteLock;
