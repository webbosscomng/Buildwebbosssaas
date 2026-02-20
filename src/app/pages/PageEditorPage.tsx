import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, Plus, Eye, EyeOff, GripVertical, Trash2, ExternalLink, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { createClient } from '../../lib/supabase';
import { uploadAvatar, uploadProductImage } from '../../lib/api';
import { useAuth } from '../App';
import type { Page, PageBlock } from '../../lib/supabase';
import { toast } from 'sonner';

type BlockType = PageBlock['type'];

type BlockFormState = {
  type: BlockType;
  title?: string;
  url?: string;
  icon?: string;
  buttonText?: string;
  phone?: string;
  message?: string;
  name?: string;
  price?: string;
  description?: string;
  image?: string;
  whatsappNumber?: string;
  embedUrl?: string;
  text?: string;
  submitText?: string;
};

const BLOCK_TYPE_OPTIONS: Array<{ type: BlockType; label: string }> = [
  { type: 'link', label: 'Link' },
  { type: 'whatsapp_cta', label: 'WhatsApp CTA' },
  { type: 'product', label: 'Product' },
  { type: 'social_row', label: 'Social Row' },
  { type: 'embed', label: 'Embed' },
  { type: 'contact_form', label: 'Contact Form' },
  { type: 'announcement', label: 'Announcement' },
  { type: 'text', label: 'Text' },
  { type: 'divider', label: 'Divider' },
];

const DEFAULT_BY_TYPE: Record<BlockType, BlockFormState> = {
  link: { type: 'link', title: 'My Link', url: 'https://', icon: '🔗' },
  whatsapp_cta: { type: 'whatsapp_cta', buttonText: 'Chat on WhatsApp', phone: '', message: 'Hi!' },
  product: { type: 'product', name: 'Product Name', price: '5000', description: '', image: '', whatsappNumber: '' },
  social_row: { type: 'social_row', text: 'Add social links in future update' },
  embed: { type: 'embed', embedUrl: '' },
  contact_form: { type: 'contact_form', title: 'Contact Me', submitText: 'Send' },
  announcement: { type: 'announcement', text: 'Welcome to my page 🎉' },
  text: { type: 'text', text: 'Write something here...' },
  divider: { type: 'divider' },
};

function prettyType(t: BlockType) {
  return BLOCK_TYPE_OPTIONS.find((x) => x.type === t)?.label || t;
}

function summarize(block: PageBlock) {
  const s = block.settings || {};
  return (
    s.title ||
    s.name ||
    s.buttonText ||
    s.text ||
    s.embedUrl ||
    (block.type === 'divider' ? 'Divider' : 'Untitled')
  );
}

function toForm(block: PageBlock): BlockFormState {
  return {
    type: block.type,
    ...DEFAULT_BY_TYPE[block.type],
    ...block.settings,
  };
}

function toSettings(form: BlockFormState): Record<string, any> {
  switch (form.type) {
    case 'link':
      return { title: form.title || 'My Link', url: form.url || '', icon: form.icon || '🔗' };
    case 'whatsapp_cta':
      return { buttonText: form.buttonText || 'Chat on WhatsApp', phone: form.phone || '', message: form.message || '' };
    case 'product':
      return {
        name: form.name || 'Product Name',
        price: form.price || '0',
        description: form.description || '',
        image: form.image || '',
        whatsappNumber: form.whatsappNumber || '',
      };
    case 'social_row':
      return { text: form.text || '' };
    case 'embed':
      return { embedUrl: form.embedUrl || '' };
    case 'contact_form':
      return { title: form.title || 'Contact', submitText: form.submitText || 'Send' };
    case 'announcement':
      return { text: form.text || '' };
    case 'text':
      return { text: form.text || '' };
    case 'divider':
      return {};
    default:
      return {};
  }
}

export default function PageEditorPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { user } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [form, setForm] = useState<BlockFormState>(DEFAULT_BY_TYPE.link);
  const [savingBlock, setSavingBlock] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const orderedBlocks = useMemo(
    () => blocks.slice().sort((a, b) => a.sort_order - b.sort_order),
    [blocks],
  );

  const nextSortOrder = useMemo(
    () => (blocks.length ? Math.max(...blocks.map((b) => b.sort_order || 0)) + 1 : 0),
    [blocks],
  );

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

  const handleAvatarUpload = async (file?: File | null) => {
    if (!file || !pageId) return;
    setUploadingAvatar(true);

    try {
      const supabase = createClient();
      const uploaded = await uploadAvatar(file, pageId);

      const { error } = await supabase
        .from('pages')
        .update({ avatar_path: uploaded.path })
        .eq('id', pageId);

      if (error) throw error;

      setPage((p) => (p ? { ...p, avatar_path: uploaded.path } : p));
      toast.success('Profile image updated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProductImageUpload = async (file?: File | null) => {
    if (!file || !pageId) return;
    setUploadingProductImage(true);

    try {
      const uploaded = await uploadProductImage(file, pageId);
      setForm((f) => ({ ...f, image: uploaded.url }));
      toast.success('Product image uploaded');
    } catch (e: any) {
      console.error(e);
      if (String(e?.message || '').toLowerCase().includes('bucket')) {
        toast.error('Create a public Supabase bucket named product-images first.');
      } else {
        toast.error('Failed to upload product image');
      }
    } finally {
      setUploadingProductImage(false);
    }
  };

  const openAddDialog = () => {
    setEditingBlock(null);
    setForm(DEFAULT_BY_TYPE.link);
    setDialogOpen(true);
  };

  const openEditDialog = (block: PageBlock) => {
    setEditingBlock(block);
    setForm(toForm(block));
    setDialogOpen(true);
  };

  const handleTypeChange = (type: BlockType) => {
    setForm(DEFAULT_BY_TYPE[type]);
  };

  const saveBlock = async () => {
    if (!pageId) return;

    // Basic validations
    if (form.type === 'link' && !form.url) {
      toast.error('Link URL is required');
      return;
    }
    if (form.type === 'whatsapp_cta' && !form.phone) {
      toast.error('WhatsApp phone is required');
      return;
    }

    setSavingBlock(true);
    try {
      const supabase = createClient();
      const settings = toSettings(form);

      if (editingBlock) {
        const { error } = await supabase
          .from('page_blocks')
          .update({
            type: form.type,
            settings,
          })
          .eq('id', editingBlock.id)
          .eq('page_id', pageId);

        if (error) throw error;

        setBlocks((prev) =>
          prev.map((b) =>
            b.id === editingBlock.id
              ? { ...b, type: form.type, settings }
              : b,
          ),
        );
        toast.success('Block updated');
      } else {
        const payload = {
          page_id: pageId,
          type: form.type,
          settings,
          sort_order: nextSortOrder,
          is_enabled: true,
        };

        const { data, error } = await supabase
          .from('page_blocks')
          .insert(payload)
          .select('*')
          .single();

        if (error) throw error;

        setBlocks((prev) => [...prev, data]);
        toast.success('Block added');
      }

      setDialogOpen(false);
    } catch (error) {
      console.error('Save block error:', error);
      toast.error('Failed to save block');
    } finally {
      setSavingBlock(false);
    }
  };

  const toggleBlock = async (block: PageBlock, checked: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('page_blocks')
        .update({ is_enabled: checked })
        .eq('id', block.id)
        .eq('page_id', block.page_id);

      if (error) throw error;

      setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, is_enabled: checked } : b)));
    } catch (error) {
      console.error('Toggle block error:', error);
      toast.error('Failed to update block');
    }
  };

  const deleteBlock = async (block: PageBlock) => {
    const ok = window.confirm('Delete this block? This action cannot be undone.');
    if (!ok) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('page_blocks')
        .delete()
        .eq('id', block.id)
        .eq('page_id', block.page_id);

      if (error) throw error;

      setBlocks((prev) => prev.filter((b) => b.id !== block.id));
      toast.success('Block deleted');
    } catch (error) {
      console.error('Delete block error:', error);
      toast.error('Failed to delete block');
    }
  };

  const moveBlock = async (blockId: string, direction: 'up' | 'down') => {
    const current = orderedBlocks.findIndex((b) => b.id === blockId);
    if (current < 0) return;

    const target = direction === 'up' ? current - 1 : current + 1;
    if (target < 0 || target >= orderedBlocks.length) return;

    const reordered = [...orderedBlocks];
    const [item] = reordered.splice(current, 1);
    reordered.splice(target, 0, item);

    const normalized = reordered.map((b, idx) => ({ ...b, sort_order: idx }));
    setBlocks(normalized);

    try {
      const supabase = createClient();
      const updates = normalized.map((b) =>
        supabase
          .from('page_blocks')
          .update({ sort_order: b.sort_order })
          .eq('id', b.id)
          .eq('page_id', b.page_id),
      );

      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    } catch (error) {
      console.error('Move block error:', error);
      toast.error('Failed to reorder block');
      // Reload server truth on failure
      loadPage();
      return;
    }

    toast.success('Block order updated');
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
                <label className="text-xs text-primary cursor-pointer inline-block mt-1">
                  {uploadingAvatar ? 'Uploading image...' : 'Upload profile image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingAvatar}
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={page.is_published ? 'default' : 'secondary'}>
                {page.is_published ? 'Published' : 'Draft'}
              </Badge>

              <Button variant="outline" size="sm" asChild>
                <Link to={`/app/pages/${pageId}/theme`}>Theme</Link>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link to={`/app/pages/${pageId}/analytics`}>Analytics</Link>
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
              <Button size="sm" onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Block
              </Button>
            </div>

            <div className="space-y-3">
              {blocks.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No blocks yet</p>
                  <Button onClick={openAddDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Block
                  </Button>
                </Card>
              ) : (
                orderedBlocks.map((block, index) => (
                    <Card key={block.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{prettyType(block.type)}</p>
                          <p className="text-sm text-muted-foreground truncate">{summarize(block)}</p>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => moveBlock(block.id, 'up')}
                            title="Move up"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === orderedBlocks.length - 1}
                            onClick={() => moveBlock(block.id, 'down')}
                            title="Move down"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <Switch checked={block.is_enabled} onCheckedChange={(v) => toggleBlock(block, !!v)} />
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(block)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteBlock(block)}>
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
                <p className="text-sm text-muted-foreground mb-6">{page.bio || 'Add a bio to your page'}</p>
              </div>

              <div className="space-y-3">
                {blocks.filter((b) => b.is_enabled).map((block) => (
                  <div key={block.id} className="border rounded-lg p-3 text-sm">
                    {prettyType(block.type)} • {summarize(block)}
                  </div>
                ))}
                {blocks.filter((b) => b.is_enabled).length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">No enabled blocks</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBlock ? 'Edit Block' : 'Add Block'}</DialogTitle>
            <DialogDescription>Configure your block content and save changes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Block Type</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3"
                value={form.type}
                onChange={(e) => handleTypeChange(e.target.value as BlockType)}
                disabled={!!editingBlock}
              >
                {BLOCK_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.type} value={opt.type}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {form.type === 'link' && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input value={form.url || ''} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
                </div>
              </>
            )}

            {form.type === 'whatsapp_cta' && (
              <>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input value={form.buttonText || ''} onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone || ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="2348012345678" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={form.message || ''} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                </div>
              </>
            )}

            {form.type === 'product' && (
              <>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Price (NGN)</Label>
                  <Input value={form.price || ''} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={form.image || ''}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="https://..."
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-primary cursor-pointer">
                      {uploadingProductImage ? 'Uploading product image...' : 'Upload product image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingProductImage}
                        onChange={(e) => handleProductImageUpload(e.target.files?.[0])}
                      />
                    </label>
                    <span className="text-xs text-muted-foreground">(uses Supabase bucket: product-images)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Tip: paste a direct image link or upload a file.</p>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description || ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
              </>
            )}

            {(form.type === 'announcement' || form.type === 'text') && (
              <div className="space-y-2">
                <Label>Text</Label>
                <Textarea value={form.text || ''} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} />
              </div>
            )}

            {form.type === 'embed' && (
              <div className="space-y-2">
                <Label>Embed URL</Label>
                <Input value={form.embedUrl || ''} onChange={(e) => setForm((f) => ({ ...f, embedUrl: e.target.value }))} />
              </div>
            )}

            {form.type === 'contact_form' && (
              <>
                <div className="space-y-2">
                  <Label>Form Title</Label>
                  <Input value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Submit Text</Label>
                  <Input value={form.submitText || ''} onChange={(e) => setForm((f) => ({ ...f, submitText: e.target.value }))} />
                </div>
              </>
            )}

            {(form.type === 'divider' || form.type === 'social_row') && (
              <p className="text-sm text-muted-foreground">No extra fields for this block type yet.</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={savingBlock}>
              Cancel
            </Button>
            <Button onClick={saveBlock} disabled={savingBlock}>
              {savingBlock ? 'Saving...' : editingBlock ? 'Update Block' : 'Add Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
