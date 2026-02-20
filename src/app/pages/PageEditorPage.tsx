import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Plus, Eye, EyeOff, GripVertical, Trash2, ExternalLink } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { createClient } from '../../lib/supabase';
import { useAuth } from '../App';
import type { Page, PageBlock } from '../../lib/supabase';
import { toast } from 'sonner';

export default function PageEditorPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { user } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);

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

        const { data: blocksData } = await supabase
          .from('page_blocks')
          .select('*')
          .eq('page_id', pageId)
          .order('sort_order', { ascending: true });

        setBlocks(blocksData || []);
      }
    } catch (error) {
      console.error('Load page error:', error);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async () => {
    if (!page || !pageId) return;

    try {
      const supabase = createClient();
      const newPublishState = !page.is_published;

      const { error } = await supabase
        .from('pages')
        .update({
          is_published: newPublishState,
          published_at: newPublishState ? new Date().toISOString() : null,
        })
        .eq('id', pageId);

      if (error) throw error;

      setPage({ ...page, is_published: newPublishState });
      toast.success(newPublishState ? 'Page published!' : 'Page unpublished');
    } catch (error) {
      console.error('Toggle publish error:', error);
      toast.error('Failed to update page');
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
      {/* Header */}
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
                <h1 className="font-semibold">{page.title || 'Untitled Page'}</h1>
                <p className="text-sm text-muted-foreground">@{page.handle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={page.is_published ? 'default' : 'secondary'}>
                {page.is_published ? 'Published' : 'Draft'}
              </Badge>
              
              <Button variant="outline" size="sm" asChild>
                <Link to={`/app/pages/${pageId}/theme`}>
                  Theme
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link to={`/app/pages/${pageId}/analytics`}>
                  Analytics
                </Link>
              </Button>

              {page.is_published && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`/@${page.handle}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </a>
                </Button>
              )}

              <Button onClick={togglePublish}>
                {page.is_published ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {page.is_published ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Content Blocks</h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Block
              </Button>
            </div>

            <div className="space-y-3">
              {blocks.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No blocks yet</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Block
                  </Button>
                </Card>
              ) : (
                blocks.map((block) => (
                  <Card key={block.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <div className="flex-1">
                        <p className="font-medium">{block.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {block.settings.title || block.settings.buttonText || 'Untitled'}
                        </p>
                      </div>
                      <Switch checked={block.is_enabled} />
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold mb-6">Preview</h2>
            <div className="bg-background border rounded-lg p-6 max-w-sm mx-auto">
              <div className="text-center">
                <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4"></div>
                <h3 className="font-semibold mb-2">{page.title || 'Page Title'}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {page.bio || 'Add a bio to your page'}
                </p>
              </div>
              
              <div className="space-y-3">
                {blocks.filter(b => b.is_enabled).map((block) => (
                  <div 
                    key={block.id} 
                    className="border rounded-lg p-3 text-sm"
                  >
                    {block.type === 'link' && '🔗 Link Block'}
                    {block.type === 'whatsapp_cta' && '💬 WhatsApp'}
                    {block.type === 'product' && '🛍️ Product'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
