import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, Zap, Globe, BarChart3, Palette, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Web Boss</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </nav>
          <div className="md:hidden">
            <Button asChild size="sm">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            🇳🇬 Built for Nigerian Creators
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Your link-in-bio,
            <br />
            <span className="text-primary">supercharged</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create a stunning mini landing page in minutes. Perfect for creators, businesses, and coaches.
            Share one link and own your online presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Free forever. No credit card required.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need to shine online</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Web Boss gives you all the tools to create a professional online presence
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Create your page in under 5 minutes. No coding required.
            </p>
          </Card>
          
          <Card className="p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Custom Domain</h3>
            <p className="text-sm text-muted-foreground">
              Use your own domain or get a free webboss.com.ng link.
            </p>
          </Card>
          
          <Card className="p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track views, clicks, and visitor behavior in real-time.
            </p>
          </Card>
          
          <Card className="p-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Beautiful Themes</h3>
            <p className="text-sm text-muted-foreground">
              Choose from gorgeous themes or customize your own.
            </p>
          </Card>
        </div>
      </section>

      {/* Nigeria-First Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
            <h2 className="text-3xl font-bold mb-6">Built for Nigerian Creators</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">WhatsApp Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Add WhatsApp buttons that work perfectly with Nigerian phone numbers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">NGN Currency Display</h3>
                  <p className="text-sm text-muted-foreground">
                    Show product prices in Naira with proper formatting
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">Fast & Reliable</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimized for Nigerian internet speeds and mobile devices
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center bg-primary text-primary-foreground rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to become a Web Boss?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of Nigerian creators and businesses already using Web Boss
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8">
            <Link to="/signup">
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold">Web Boss</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/pricing" className="hover:text-foreground transition-colors">
                Pricing
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Web Boss. Made in 🇳🇬
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
