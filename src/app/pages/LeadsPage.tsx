import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Download, Mail, Phone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { createClient, type Lead, type Page } from '../../lib/supabase';
import { useAuth } from '../App';
import { toast } from 'sonner';

type LeadRow = Lead & { page?: Pick<Page, 'id' | 'handle' | 'title'> | null };

function toCSV(rows: LeadRow[]) {
  const header = ['created_at', 'page_handle', 'page_title', 'name', 'email', 'phone', 'message', 'source_url'];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [
    r.created_at,
    r.page?.handle || '',
    r.page?.title || '',
    r.name || '',
    r.email || '',
    r.phone || '',
    r.message || '',
    r.source_url || '',
  ].map(esc).join(','));
  return [header.join(','), ...lines].join('\n');
}

export default function LeadsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [pages, setPages] = useState<Array<Pick<Page, 'id' | 'handle' | 'title'>>>([]);
  const [loading, setLoading] = useState(true);

  const [pageFilter, setPageFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const supabase = createClient();

      const { data: pagesData, error: pagesErr } = await supabase
        .from('pages')
        .select('id,handle,title')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      if (pagesErr) throw pagesErr;
      const myPages = pagesData || [];
      setPages(myPages);

      const { data: leadsData, error: leadsErr } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (leadsErr) throw leadsErr;

      const pageMap = new Map(myPages.map((p) => [p.id, p]));
      const joined: LeadRow[] = (leadsData || []).map((l) => ({
        ...l,
        page: pageMap.get(l.page_id) || null,
      }));

      setRows(joined);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const byPage = pageFilter === 'all' || r.page_id === pageFilter;
      const q = query.trim().toLowerCase();
      const byQuery =
        !q ||
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (r.phone || '').toLowerCase().includes(q) ||
        (r.message || '').toLowerCase().includes(q) ||
        (r.page?.handle || '').toLowerCase().includes(q);
      return byPage && byQuery;
    });
  }, [rows, pageFilter, query]);

  const exportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webboss-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/app">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-lg">Leads</h1>
              <p className="text-sm text-muted-foreground">View messages from your contact forms</p>
            </div>
          </div>

          <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        <Card className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Filter by page</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3"
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
              >
                <option value="all">All pages</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    @{p.handle} {p.title ? `(${p.title})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Search</Label>
              <Input
                placeholder="Search name, email, phone, message..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading leads...</Card>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No leads yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Publish a page with a Contact Form block and submissions will appear here.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((lead) => (
              <Card key={lead.id} className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span>@{lead.page?.handle || 'unknown-page'}</span>
                      <span>•</span>
                      <span>{new Date(lead.created_at).toLocaleString()}</span>
                    </div>

                    <div className="font-medium">{lead.name || 'Anonymous'}</div>

                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      {lead.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5" /> {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" /> {lead.phone}
                        </div>
                      )}
                    </div>

                    {lead.message && (
                      <p className="mt-3 text-sm whitespace-pre-wrap break-words">{lead.message}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
