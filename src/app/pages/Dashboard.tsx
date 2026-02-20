import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Plus, ExternalLink, BarChart3, Settings, LogOut, Zap, Sparkles, TrendingUp, Inbox } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { EmptyState } from '../components/EmptyState';
import { createClient } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { useAuth } from '../App';
import type { Page, Subscription } from '../../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getAvatarUrl } from '../../lib/api';
import { cloudinaryOptimized } from '../../lib/cloudinary';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrls, setAvatarUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Load pages
      const { data: pagesData } = await supabase
        .from('pages')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      setPages(pagesData || []);

      // Resolve avatar signed URLs (non-fatal)
      const pagesWithAvatars = (pagesData || []).filter(p => !!p.avatar_path);
      const results = await Promise.all(
        pagesWithAvatars.map(async (p) => {
          try {
            const url = await getAvatarUrl(p.avatar_path as any);
            return [p.id, url] as const;
          } catch {
            return [p.id, ''] as const;
          }
        }),
      );
      const map: Record<string, string> = {};
      for (const [id, url] of results) {
        if (url) map[id] = url;
      }
      setAvatarUrls(map);

      // Load subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      setSubscription(subData);

      // Check if onboarding needed
      if (!pagesData || pagesData.length === 0) {
        navigate('/app/onboarding');
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <div className="absolute inset-0 animate-pulse-glow bg-primary/20 rounded-full"></div>
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  const plan = subscription?.plan || 'free';
  const canCreateMore = plan === 'pro' || pages.length < 1;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-mesh opacity-30 -z-10" />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-background/80 backdrop-blur-xl border-b sticky top-0 z-50 shadow-sm"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/app" className="flex items-center gap-2 group">
                <div className="relative">
                  <Zap className="h-6 w-6 text-primary relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-primary/30 blur-lg animate-pulse-glow" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Web Boss
                </span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-4">
                <Link 
                  to="/app" 
                  className="text-sm font-medium text-primary flex items-center gap-1"
                >
                  <TrendingUp className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link 
                  to="/app/leads" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Inbox className="h-4 w-4" />
                  Leads
                </Link>
                <Link 
                  to="/app/settings" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Settings
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Badge 
                variant={plan === 'pro' ? 'default' : 'secondary'}
                className={plan === 'pro' ? 'gradient-primary-animated text-white border-0' : ''}
              >
                {plan === 'pro' && <Sparkles className="h-3 w-3 mr-1" />}
                {plan.toUpperCase()}
              </Badge>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                My Pages
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your link-in-bio pages
              </p>
            </div>
            
            {canCreateMore ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="gradient-primary-animated shadow-lg hover:shadow-primary/50 transition-all">
                  <Link to="/app/onboarding">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Page
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild className="gradient-primary-animated shadow-lg hover:shadow-primary/50 transition-all">
                  <Link to="/pricing">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>

          {!canCreateMore && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-2 border-yellow-200 dark:border-yellow-900 rounded-xl p-4 mb-6"
            >
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                ⚡ You've reached the page limit on the Free plan. Upgrade to Pro to create up to 10 pages.
              </p>
            </motion.div>
          )}
        </motion.div>

        {pages.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyState
              title="No pages yet"
              description="Create your first page to get started with Web Boss"
              action={{
                label: 'Create Your First Page',
                onClick: () => navigate('/app/onboarding'),
              }}
            />
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="h-full hover-lift bg-card/50 backdrop-blur-sm border-2 hover:border-primary/30 transition-all duration-300 relative overflow-hidden group">
                  {/* Decorative gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                          <AvatarImage src={avatarUrls[page.id] ? cloudinaryOptimized(avatarUrls[page.id], 120) : undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-bold">
                            {page.title?.slice(0, 2).toUpperCase() || '??'}
                          </AvatarFallback>
                        </Avatar>
                        {page.is_published && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                        )}
                      </div>
                      <Badge 
                        variant={page.is_published ? 'default' : 'secondary'}
                        className={page.is_published ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {page.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    
                    <CardTitle className="line-clamp-1 text-xl">
                      {page.title || 'Untitled Page'}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-base">
                      @{page.handle}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                        asChild
                      >
                        <Link to={`/app/pages/${page.id}/editor`}>
                          Edit
                        </Link>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                        asChild
                      >
                        <Link to={`/app/pages/${page.id}/analytics`}>
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                      </Button>
                      
                      {page.is_published && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                          asChild
                        >
                          <a 
                            href={`/@${page.handle}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}