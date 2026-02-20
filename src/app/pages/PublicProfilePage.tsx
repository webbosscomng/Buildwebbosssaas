import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { createClient } from '../../lib/supabase';
import type { Page, PageBlock } from '../../lib/supabase';
import type { ThemeTokens } from '../../lib/theme';
import { tokensToCssVars } from '../../lib/theme';
import { cloudinaryOptimized } from '../../lib/cloudinary';
import { BlockRenderer } from '../components/blocks/BlockRenderer';
import { NotFoundState, ErrorState } from '../components/EmptyState';
import { Skeleton } from '../components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { getAvatarUrl, logAnalyticsEvent } from '../../lib/api';
import { getSessionId } from '../../lib/utils';

export default function PublicProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [themeTokens, setThemeTokens] = useState<ThemeTokens | null>(null);

  useEffect(() => {
    loadPage();
  }, [handle]);

  useEffect(() => {
    let cancelled = false;

    async function resolveAvatar() {
      if (!page?.avatar_path) {
        setAvatarUrl(null);
        return;
      }

      try {
        const url = await getAvatarUrl(page.avatar_path);
        if (!cancelled) setAvatarUrl(url);
      } catch (e) {
        // non-fatal
        if (!cancelled) setAvatarUrl(null);
      }
    }

    resolveAvatar();

    return () => {
      cancelled = true;
    };
  }, [page?.avatar_path]);

  useEffect(() => {
    if (page) {
      // Log page view
      logAnalyticsEvent({
        page_id: page.id,
        event_type: 'page_view',
        session_id: getSessionId(),
        meta: {
          handle: page.handle,
        },
      }).catch(console.error);
    }
  }, [page]);

  const loadPage = async () => {
    if (!handle) return;

    try {
      setLoading(true);
      const supabase = createClient();

      // Load page
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('handle', handle.replace('@', ''))
        .eq('is_published', true)
        .single();

      if (pageError || !pageData) {
        setError('Page not found');
        return;
      }

      setPage(pageData);

      // Load theme tokens (optional)
      if (pageData.theme_id) {
        const { data: themeData } = await supabase
          .from('themes')
          .select('tokens')
          .eq('id', pageData.theme_id)
          .single();

        if (themeData?.tokens) {
          setThemeTokens(themeData.tokens as any);
        }
      } else {
        setThemeTokens(null);
      }

      // Load blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('is_enabled', true)
        .order('sort_order', { ascending: true });

      if (blocksError) {
        console.error('Blocks error:', blocksError);
      } else {
        setBlocks(blocksData || []);
      }
    } catch (err: any) {
      console.error('Load page error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockClick = (blockId: string) => {
    if (page) {
      logAnalyticsEvent({
        page_id: page.id,
        event_type: 'link_click',
        block_id: blockId,
        session_id: getSessionId(),
      }).catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <NotFoundState />
      </div>
    );
  }

  const theme = page.theme_preset || 'clean';
  const initials = page.title?.slice(0, 2).toUpperCase() || '??';

  return (
    <div 
      className="min-h-screen bg-background"
      data-theme={theme}
      style={themeTokens ? (tokensToCssVars(themeTokens) as any) : undefined}
    >
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-border">
            <AvatarImage src={avatarUrl ? cloudinaryOptimized(avatarUrl, 300) : undefined} alt={page.title || ''} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          
          {page.title && (
            <h1 className="text-2xl font-bold mb-2">{page.title}</h1>
          )}
          
          {page.bio && (
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {page.bio}
            </p>
          )}
        </div>

        {/* Blocks */}
        <div className="space-y-4 mb-12">
          {blocks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No content available yet
            </div>
          ) : (
            blocks.map((block) => (
              <BlockRenderer 
                key={block.id} 
                block={block}
                onBlockClick={handleBlockClick}
              />
            ))
          )}
        </div>

        {/* Footer / Watermark */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Made with{' '}
            <a 
              href="https://webboss.com.ng" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Web Boss
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
