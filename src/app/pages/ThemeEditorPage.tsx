import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { createClient } from '../../lib/supabase';
import { useAuth } from '../App';
import type { Page } from '../../lib/supabase';
import { toast } from 'sonner';

const THEME_PRESETS = [
  { id: 'clean', label: 'Clean', description: 'Simple and professional' },
  { id: 'midnight', label: 'Midnight', description: 'Dark and elegant' },
  { id: 'vibrant', label: 'Vibrant', description: 'Colorful and bold' },
] as const;

type ThemePresetId = (typeof THEME_PRESETS)[number]['id'];

function ThemeMiniPreview({ theme }: { theme: ThemePresetId }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border bg-background shadow-sm"
      data-theme={theme}
    >
      {/* phone-ish frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="relative p-4">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="h-10 w-10 rounded-full bg-muted border" />
          <div className="mt-2 h-3 w-24 rounded bg-muted" />
          <div className="mt-2 h-2 w-36 rounded bg-muted" />
        </div>

        <div className="space-y-2">
          <div className="h-10 w-full rounded-lg bg-card border" />
          <div className="h-10 w-full rounded-lg bg-card border" />
          <div className="h-10 w-full rounded-lg bg-card border" />
          <div className="h-10 w-full rounded-lg bg-primary/90" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="h-6 w-6 rounded-full bg-muted border" />
          <div className="h-6 w-6 rounded-full bg-muted border" />
          <div className="h-6 w-6 rounded-full bg-muted border" />
        </div>
      </div>

      {/* enforce 9:16 preview aspect */}
      <div className="pointer-events-none absolute inset-0" />
    </div>
  );
}

export default function ThemeEditorPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { user } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ThemePresetId>('clean');
  const [originalTheme, setOriginalTheme] = useState<ThemePresetId>('clean');
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
        const preset = (pageData.theme_preset || 'clean') as ThemePresetId;
        setSelectedTheme(preset);
        setOriginalTheme(preset);
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

      setOriginalTheme(selectedTheme);
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

            <Button onClick={handleSave} disabled={saving || selectedTheme === originalTheme}>
              {saving ? 'Saving...' : selectedTheme === originalTheme ? 'Saved' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Choose a Theme</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pick a preset. You’ll be able to fine-tune colors, fonts, and buttons next.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setSelectedTheme(originalTheme)}
              disabled={selectedTheme === originalTheme}
            >
              Reset
            </Button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {THEME_PRESETS.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <Card
                  key={theme.id}
                  role="button"
                  tabIndex={0}
                  className={
                    'p-4 cursor-pointer transition-all border-2 ' +
                    (isSelected
                      ? 'border-primary shadow-md'
                      : 'border-transparent hover:border-primary/40 hover:shadow-sm')
                  }
                  onClick={() => setSelectedTheme(theme.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedTheme(theme.id);
                    }
                  }}
                >
                  <div className="aspect-[9/16] mb-4">
                    <ThemeMiniPreview theme={theme.id} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold leading-none">{theme.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
                    </div>
                    {isSelected && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Selected
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
