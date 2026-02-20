import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Palette, Radius } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { createClient } from '../../lib/supabase';
import { useAuth } from '../App';
import type { Page } from '../../lib/supabase';
import type { ThemeTokens } from '../../lib/theme';
import { THEME_TOKEN_PRESETS, tokensToCssVars } from '../../lib/theme';
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
  const [themeId, setThemeId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<ThemeTokens>(THEME_TOKEN_PRESETS.clean);
  const [originalTokens, setOriginalTokens] = useState<ThemeTokens>(THEME_TOKEN_PRESETS.clean);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const hasChanges = useMemo(() => {
    return selectedTheme !== originalTheme || JSON.stringify(tokens) !== JSON.stringify(originalTokens);
  }, [selectedTheme, originalTheme, tokens, originalTokens]);

  const previewStyle = useMemo(() => tokensToCssVars(tokens), [tokens]);

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

      if (!pageData) return;

      setPage(pageData);
      const preset = (pageData.theme_preset || 'clean') as ThemePresetId;
      setSelectedTheme(preset);
      setOriginalTheme(preset);

      // Load or create theme
      if (pageData.theme_id) {
        setThemeId(pageData.theme_id);
        const { data: themeData } = await supabase
          .from('themes')
          .select('tokens')
          .eq('id', pageData.theme_id)
          .single();

        const loadedTokens = (themeData?.tokens || THEME_TOKEN_PRESETS[preset]) as ThemeTokens;
        setTokens(loadedTokens);
        setOriginalTokens(loadedTokens);
      } else {
        // Create a theme row for this page so we can persist custom tokens.
        const initialTokens = THEME_TOKEN_PRESETS[preset] as ThemeTokens;
        const { data: newTheme, error: themeErr } = await supabase
          .from('themes')
          .insert({
            owner_id: user.id,
            name: `Theme for @${pageData.handle}`,
            tokens: initialTokens,
            is_public: false,
          })
          .select('id')
          .single();

        if (themeErr) throw themeErr;
        setThemeId(newTheme.id);

        // Attach to page
        const { error: pageErr } = await supabase
          .from('pages')
          .update({ theme_id: newTheme.id })
          .eq('id', pageData.id);

        if (pageErr) throw pageErr;

        setTokens(initialTokens);
        setOriginalTokens(initialTokens);
      }
    } catch (error) {
      console.error('Load page error:', error);
      toast.error('Failed to load theme');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pageId || !themeId) return;

    setSaving(true);
    try {
      const supabase = createClient();

      const { error: themeErr } = await supabase
        .from('themes')
        .update({ tokens })
        .eq('id', themeId);

      if (themeErr) throw themeErr;

      const { error: pageErr } = await supabase
        .from('pages')
        .update({ theme_preset: selectedTheme, theme_id: themeId })
        .eq('id', pageId);

      if (pageErr) throw pageErr;

      setOriginalTheme(selectedTheme);
      setOriginalTokens(tokens);
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

            <Button onClick={handleSave} disabled={saving || !hasChanges}>
              {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
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
              onClick={() => {
                setSelectedTheme(originalTheme);
                setTokens(originalTokens);
              }}
              disabled={!hasChanges}
            >
              Reset
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            {/* Presets + controls */}
            <div>
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
                      onClick={() => {
                        setSelectedTheme(theme.id);
                        const presetTokens = THEME_TOKEN_PRESETS[theme.id];
                        setTokens(presetTokens);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedTheme(theme.id);
                          const presetTokens = THEME_TOKEN_PRESETS[theme.id];
                          setTokens(presetTokens);
                        }
                      }}
                    >
                      <div className="aspect-[9/16] mb-4">
                        <div style={tokensToCssVars(THEME_TOKEN_PRESETS[theme.id]) as any}>
                          <ThemeMiniPreview theme={theme.id} />
                        </div>
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

              <div className="mt-8">
                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Customize</h3>
                    <p className="text-sm text-muted-foreground ml-2">(live preview)</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Primary</Label>
                      <Input
                        type="color"
                        value={tokens.primary}
                        onChange={(e) => setTokens((t) => ({ ...t, primary: e.target.value }))}
                        className="h-10 p-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Primary text</Label>
                      <Input
                        type="color"
                        value={tokens.primaryForeground}
                        onChange={(e) => setTokens((t) => ({ ...t, primaryForeground: e.target.value }))}
                        className="h-10 p-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Background</Label>
                      <Input
                        type="color"
                        value={tokens.background}
                        onChange={(e) => setTokens((t) => ({ ...t, background: e.target.value }))}
                        className="h-10 p-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input
                        type="color"
                        value={tokens.foreground}
                        onChange={(e) => setTokens((t) => ({ ...t, foreground: e.target.value }))}
                        className="h-10 p-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Card</Label>
                      <Input
                        type="color"
                        value={tokens.card}
                        onChange={(e) => setTokens((t) => ({ ...t, card: e.target.value }))}
                        className="h-10 p-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Card text</Label>
                      <Input
                        type="color"
                        value={tokens.cardForeground}
                        onChange={(e) => setTokens((t) => ({ ...t, cardForeground: e.target.value }))}
                        className="h-10 p-1"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Radius className="h-4 w-4" />
                          Radius
                        </Label>
                        <span className="text-sm text-muted-foreground">{tokens.radius}</span>
                      </div>
                      <input
                        type="range"
                        min={4}
                        max={20}
                        value={Math.round(parseFloat(tokens.radius) * 16)}
                        onChange={(e) => {
                          const px = Number(e.target.value);
                          setTokens((t) => ({ ...t, radius: `${px / 16}rem` }));
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Live preview */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="p-4">
                <div className="text-sm font-medium mb-3">Preview</div>
                <div
                  className="aspect-[9/16] rounded-xl overflow-hidden border bg-background"
                  style={previewStyle as any}
                >
                  <div className="p-4">
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className="h-12 w-12 rounded-full bg-muted border" />
                      <div className="mt-2 h-3 w-28 rounded bg-muted" />
                      <div className="mt-2 h-2 w-40 rounded bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-11 w-full rounded-lg bg-card border" />
                      <div className="h-11 w-full rounded-lg bg-card border" />
                      <div className="h-11 w-full rounded-lg bg-card border" />
                      <div className="h-11 w-full rounded-lg bg-primary" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  This preview uses your current token settings.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
