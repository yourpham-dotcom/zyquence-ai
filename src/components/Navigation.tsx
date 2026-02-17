import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { isPro } = useSubscription();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gradient">Zyquence</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#mission" className="text-muted-foreground hover:text-foreground transition-colors">
              Mission
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            {isPro && (
              <>
                <a href="/data-intelligence" className="text-muted-foreground hover:text-foreground transition-colors">
                  Data Intelligence
                </a>
                <a href="/gaming-intelligence" className="text-muted-foreground hover:text-foreground transition-colors">
                  Gaming Engine
                </a>
                <a href="/artist-intelligence" className="text-muted-foreground hover:text-foreground transition-colors">
                  Artist Intelligence
                </a>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="w-5 h-5" />
                  {user && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                {user ? (
                  <>
                    <DropdownMenuItem className="text-xs text-muted-foreground cursor-default focus:bg-transparent">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <a href="/auth" className="cursor-pointer">Login</a>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <a href="#mission" className="block text-muted-foreground hover:text-foreground transition-colors">
              Mission
            </a>
            <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            {isPro && (
              <>
                <a href="/data-intelligence" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Data Intelligence
                </a>
                <a href="/gaming-intelligence" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Gaming Engine
                </a>
                <a href="/artist-intelligence" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Artist Intelligence
                </a>
              </>
            )}
            {user ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <Button variant="outline" className="w-full text-destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full" asChild>
                <a href="/auth">Login</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
