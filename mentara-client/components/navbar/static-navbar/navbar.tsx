"use client";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Menu, LogIn } from "lucide-react";
import { useState } from "react";

const navigationItems = [
  { content: "About", redirect: "/about", description: "Learn about our mission" },
  { content: "Community", redirect: "/community", description: "Join our support network" },
  { content: "Treatment", redirect: "/pre-assessment", description: "Start your assessment" },
  {
    content: "Therapist Application",
    redirect: "/therapist-application",
    description: "Join our expert team",
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map(({ content, redirect }) => (
              <Link key={redirect} href={redirect}>
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  {content}
                </Button>
              </Link>
            ))}
            
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
              <Link href="/sign-in">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Log In
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-8">
                    <Logo />
                    <Badge variant="secondary" className="mt-3 bg-primary/10 text-primary border-primary/20">
                      Mental Health Platform
                    </Badge>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 space-y-2">
                    {navigationItems.map(({ content, redirect, description }) => (
                      <Link 
                        key={redirect} 
                        href={redirect}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <div className="p-3 rounded-lg hover:bg-primary/10 transition-colors group">
                          <div className="font-medium text-secondary group-hover:text-primary transition-colors">
                            {content}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Auth Buttons */}
                  <div className="space-y-3 pt-6 border-t border-border">
                    <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                      <Button 
                        variant="outline" 
                        className="w-full border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Log In
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
