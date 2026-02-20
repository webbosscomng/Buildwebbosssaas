import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Calendar, TrendingUp, MousePointerClick, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { MetricCard } from '../components/MetricCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { createClient } from '../../lib/supabase';
import { getAnalyticsSummary } from '../../lib/api';
import { useAuth } from '../App';
import type { Page } from '../../lib/supabase';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { user } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [pageId, days]);

  const loadData = async () => {
    if (!pageId || !user) return;

    try {
      const supabase = createClient();

      const { data: pageData } = await supabase
        .from('pages')
        .select('*')
        .eq('id', pageId)
        .eq('owner_id', user.id)
        .single();

      if (pageData) {
        setPage(pageData);

        const analyticsData = await getAnalyticsSummary(pageId, days);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Load analytics error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Page not found</h2>
          <Button asChild>
            <Link to="/app">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/app">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">Analytics</h1>
                <p className="text-sm text-muted-foreground">@{page.handle}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant={days === 7 ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setDays(7)}
              >
                7 Days
              </Button>
              <Button 
                variant={days === 30 ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setDays(30)}
              >
                30 Days
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Metrics */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <MetricCard
            title="Total Views"
            value={analytics?.summary?.total_views || 0}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            title="Link Clicks"
            value={analytics?.summary?.total_clicks || 0}
            icon={<MousePointerClick className="h-4 w-4" />}
          />
          <MetricCard
            title="Unique Visitors"
            value={analytics?.summary?.unique_visitors || 0}
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        {/* Charts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Activity Over Time</h3>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart visualization would go here
          </div>
        </Card>
      </main>
    </div>
  );
}
