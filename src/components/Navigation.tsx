import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, User } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-background/80 border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyber-blue to-cyber-cyan rounded-lg" />
            <span className="text-2xl font-bold text-gradient">Zyquence</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#products" className="text-muted-foreground hover:text-foreground transition-colors">
              Products
            </a>
            <a href="#mission" className="text-muted-foreground hover:text-foreground transition-colors">
              Mission
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="/data-intelligence" className="text-muted-foreground hover:text-foreground transition-colors">
              Data Intelligence
            </a>
            <a href="/gaming-intelligence" className="text-muted-foreground hover:text-foreground transition-colors">
              Gaming Engine
            </a>
            <a href="/ai-builder" className="text-muted-foreground hover:text-foreground transition-colors">
              AI Builder
            </a>
            <Button variant="default" className="bg-cyber-blue hover:bg-cyber-blue/90" asChild>
              <a href="/studio">Launch Studio</a>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                <DropdownMenuItem asChild>
                  <a href="/auth" className="cursor-pointer">Login</a>
                </DropdownMenuItem>
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
            <a href="#products" className="block text-muted-foreground hover:text-foreground transition-colors">
              Products
            </a>
            <a href="#mission" className="block text-muted-foreground hover:text-foreground transition-colors">
              Mission
            </a>
            <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="/data-intelligence" className="block text-muted-foreground hover:text-foreground transition-colors">
              Data Intelligence
            </a>
            <a href="/gaming-intelligence" className="block text-muted-foreground hover:text-foreground transition-colors">
              Gaming Engine
            </a>
            <a href="/ai-builder" className="block text-muted-foreground hover:text-foreground transition-colors">
              AI Builder
            </a>
            <Button variant="default" className="w-full bg-cyber-blue hover:bg-cyber-blue/90" asChild>
              <a href="/studio">Launch Studio</a>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <a href="/auth">Login</a>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
