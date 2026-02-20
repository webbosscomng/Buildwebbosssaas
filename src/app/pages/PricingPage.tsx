import React from 'react';
import { Link } from 'react-router';
import { Check, Zap, Sparkles, Crown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { motion } from 'motion/react';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-mesh opacity-40 -z-10" />
      
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Zap className="h-6 w-6 text-primary relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-primary/30 blur-lg animate-pulse-glow" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Web Boss
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Button asChild size="sm" className="gradient-primary-animated">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple Pricing
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Choose Your <span className="text-gradient">Plan</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <Card className="h-full hover-lift bg-card/50 backdrop-blur-sm border-2 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <Badge variant="secondary" className="text-xs">Forever Free</Badge>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold">₦0</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <CardDescription className="text-base">
                  Perfect for getting started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full mb-8 h-12 text-base border-2 hover:border-primary hover:bg-primary/5" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
                
                <div className="space-y-4">
                  {[
                    '1 page',
                    'Up to 10 blocks',
                    'webboss.com.ng domain',
                    'Basic analytics (7 days)',
                    'WhatsApp integration',
                    'Basic themes'
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="relative"
          >
            {/* Popular badge with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -top-4 -right-4 z-10"
            >
              <div className="gradient-primary-animated text-white text-sm font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-1">
                <Crown className="h-4 w-4" />
                POPULAR
              </div>
            </motion.div>

            <Card className="h-full hover-lift bg-card/50 backdrop-blur-sm border-4 border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden">
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 opacity-50" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Pro</CardTitle>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">Best Value</Badge>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gradient">₦5,000</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <CardDescription className="text-base">
                  For serious creators and businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <Button className="w-full mb-8 h-12 text-base gradient-primary-animated shadow-lg hover:shadow-primary/50 transition-all" asChild>
                  <Link to="/signup">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Free Trial
                  </Link>
                </Button>
                
                <div className="space-y-4">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold">Everything in Free, plus:</span>
                  </motion.div>
                  
                  {[
                    'Up to 10 pages',
                    'Unlimited blocks',
                    'Custom domain',
                    'Full analytics (365 days)',
                    'Advanced themes',
                    'Remove watermark',
                    'Priority support'
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <Card className="inline-block px-8 py-4 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 border-primary/20">
            <p className="text-sm text-muted-foreground">
              ✨ All plans include <span className="font-semibold text-foreground">unlimited page views</span> and <span className="font-semibold text-foreground">traffic</span>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}