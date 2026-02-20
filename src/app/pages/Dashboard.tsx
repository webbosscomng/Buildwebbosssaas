import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Plus, ExternalLink, BarChart3, Settings, LogOut, Zap } from 'lucide-react';
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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const plan = subscription?.plan || 'free';
  const canCreateMore = plan === 'pro' || pages.length < 1;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/app" className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Web Boss</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-4">
                <Link 
                  to="/app" 
                  className="text-sm font-medium text-primary"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/app/settings" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Settings
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={plan === 'pro' ? 'default' : 'secondary'}>
                {plan.toUpperCase()}
              </Badge>
              
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">My Pages</h1>
              <p className="text-muted-foreground mt-1">
                Manage your link-in-bio pages
              </p>
            </div>
            
            {canCreateMore ? (
              <Button asChild>
                <Link to="/app/onboarding">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Page
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/pricing">
                  Upgrade to Pro
                </Link>
              </Button>
            )}
          </div>

          {!canCreateMore && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You've reached the page limit on the Free plan. Upgrade to Pro to create up to 10 pages.
              </p>
            </div>
          )}
        </div>

        {pages.length === 0 ? (
          <EmptyState
            title="No pages yet"
            description="Create your first page to get started with Web Boss"
            action={{
              label: 'Create Your First Page',
              onClick: () => navigate('/app/onboarding'),
            }}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Card key={page.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={page.avatar_path || undefined} />
                      <AvatarFallback>
                        {page.title?.slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant={page.is_published ? 'default' : 'secondary'}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  
                  <CardTitle className="line-clamp-1">
                    {page.title || 'Untitled Page'}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    @{page.handle}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      asChild
                    >
                      <Link to={`/app/pages/${page.id}/editor`}>
                        Edit
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
