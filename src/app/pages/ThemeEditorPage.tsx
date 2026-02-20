import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { createClient } from '../../lib/supabase';
import { useAuth } from '../App';
import type { Page } from '../../lib/supabase';
import { toast } from 'sonner';

const THEME_PRESETS = [
  { id: 'clean', label: 'Clean', description: 'Simple and professional' },
  { id: 'midnight', label: 'Midnight', description: 'Dark and elegant' },
  { id: 'vibrant', label: 'Vibrant', description: 'Colorful and bold' },
];

export default function ThemeEditorPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { user } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('clean');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
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
        setSelectedTheme(pageData.theme_preset || 'clean');
      }
    } catch (error) {
      console.error('Load page error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pageId) return;

    setSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('pages')
        .update({ theme_preset: selectedTheme })
        .eq('id', pageId);

      if (error) throw error;

      toast.success('Theme updated!');
    } catch (error) {
      console.error('Save theme error:', error);
      toast.error('Failed to save theme');
    } finally {
      setSaving(false);
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
                <Link to={`/app/pages/${pageId}/editor`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">Theme Editor</h1>
                <p className="text-sm text-muted-foreground">@{page.handle}</p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Choose a Theme</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {THEME_PRESETS.map((theme) => (
              <Card
                key={theme.id}
                className={`p-6 cursor-pointer transition-all ${
                  selectedTheme === theme.id
                    ? 'border-primary border-2'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedTheme(theme.id)}
              >
                <div className="aspect-[9/16] bg-muted rounded-lg mb-4"></div>
                <h3 className="font-semibold mb-1">{theme.label}</h3>
                <p className="text-sm text-muted-foreground">{theme.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
