import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, Zap, Globe, BarChart3, Palette, Check, Sparkles, Shield, Rocket } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { motion } from 'motion/react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background gradient mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-60 -z-10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '2s' }} />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap className="h-6 w-6 text-primary relative z-10" />
              <div className="absolute inset-0 bg-primary/30 blur-lg animate-pulse-glow" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Web Boss
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105">
              Pricing
            </Link>
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105">
              Log in
            </Link>
            <Button asChild className="gradient-primary-animated shadow-lg hover:shadow-primary/50 transition-all duration-300">
              <Link to="/signup">Get Started</Link>
            </Button>
          </nav>
          <div className="md:hidden">
            <Button asChild size="sm" className="gradient-primary-animated">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 text-primary rounded-full text-sm font-medium mb-6 border border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4" />
            🇳🇬 Built for Nigerian Creators
          </motion.div>
          
          <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
          >
            Your link-in-bio,
            <br />
            <span className="text-gradient animate-gradient">supercharged</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Create a stunning mini landing page in minutes. Perfect for creators, businesses, and coaches.
            Share one link and own your online presence.
          </motion.p>
          
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="text-lg px-10 py-6 gradient-primary-animated shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 group">
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2"
          >
            <Shield className="h-4 w-4 text-green-600" />
            Free forever. No credit card required.
          </motion.p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/20 rounded-full animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-32 h-32 border-2 border-purple-500/20 rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need to shine online</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Web Boss gives you all the tools to create a professional online presence
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Create your page in under 5 minutes. No coding required.', delay: 0 },
            { icon: Globe, title: 'Custom Domain', desc: 'Use your own domain or get a free webboss.com.ng link.', delay: 0.1 },
            { icon: BarChart3, title: 'Analytics', desc: 'Track views, clicks, and visitor behavior in real-time.', delay: 0.2 },
            { icon: Palette, title: 'Beautiful Themes', desc: 'Choose from gorgeous themes or customize your own.', delay: 0.3 }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <Card className="p-6 h-full hover-lift bg-card/50 backdrop-blur-sm border-2 hover:border-primary/20 transition-all duration-300">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 relative group">
                  <feature.icon className="h-7 w-7 text-primary relative z-10" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nigeria-First Features */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-8 md:p-12 bg-gradient-to-br from-green-50 via-emerald-50 to-white dark:from-green-950/20 dark:to-background border-2 border-green-200/50 dark:border-green-800/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-green-600 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Built for Nigerian Creators</h2>
            </div>
            <div className="space-y-6">
              {[
                { title: 'WhatsApp Integration', desc: 'Add WhatsApp buttons that work perfectly with Nigerian phone numbers' },
                { title: 'NGN Currency Display', desc: 'Show product prices in Naira with proper formatting' },
                { title: 'Fast & Reliable', desc: 'Optimized for Nigerian internet speeds and mobile devices' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -30, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 group"
                >
                  <div className="h-7 w-7 rounded-full bg-green-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center gradient-primary-animated text-white rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to become a Web Boss?
            </h2>
            <p className="text-lg md:text-xl mb-10 opacity-90">
              Join thousands of Nigerian creators and businesses already using Web Boss
            </p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
              <Link to="/signup">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Web Boss</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                Pricing
              </Link>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300">
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