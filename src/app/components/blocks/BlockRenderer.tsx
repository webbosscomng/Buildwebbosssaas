import React from 'react';
import { ExternalLink, MessageCircle, Youtube, Mail, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import type { PageBlock } from '../../../lib/supabase';
import { createClient } from '../../../lib/supabase';
import { generateWhatsAppLink, formatCurrency } from '../../../lib/utils';
import { toast } from 'sonner';

interface BlockRendererProps {
  block: PageBlock;
  onBlockClick?: (blockId: string) => void;
}

export function BlockRenderer({ block, onBlockClick }: BlockRendererProps) {
  const handleClick = () => {
    if (onBlockClick) {
      onBlockClick(block.id);
    }
  };

  if (!block.is_enabled) {
    return null;
  }

  switch (block.type) {
    case 'link':
      return <LinkBlock block={block} onClick={handleClick} />;
    case 'whatsapp_cta':
      return <WhatsAppCTABlock block={block} onClick={handleClick} />;
    case 'product':
      return <ProductBlock block={block} onClick={handleClick} />;
    case 'social_row':
      return <SocialRowBlock block={block} onClick={handleClick} />;
    case 'embed':
      return <EmbedBlock block={block} />;
    case 'contact_form':
      return <ContactFormBlock block={block} />;
    case 'announcement':
      return <AnnouncementBlock block={block} />;
    case 'text':
      return <TextBlock block={block} />;
    case 'divider':
      return <DividerBlock />;
    default:
      return null;
  }
}

function LinkBlock({ block, onClick }: { block: PageBlock; onClick: () => void }) {
  const { title, url, icon } = block.settings;
  
  const handleClick = () => {
    onClick();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="w-full h-auto py-4 px-6 text-left justify-between hover:scale-[1.02] transition-transform"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="font-medium">{title || 'Untitled Link'}</span>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0" />
    </Button>
  );
}

function WhatsAppCTABlock({ block, onClick }: { block: PageBlock; onClick: () => void }) {
  const { phone, message, buttonText } = block.settings;
  
  const handleClick = () => {
    onClick();
    const whatsappUrl = generateWhatsAppLink(phone, message);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <Button
      onClick={handleClick}
      className="w-full h-auto py-4 px-6 bg-green-600 hover:bg-green-700 text-white"
    >
      <MessageCircle className="h-5 w-5 mr-2" />
      {buttonText || 'Chat on WhatsApp'}
    </Button>
  );
}

function ProductBlock({ block, onClick }: { block: PageBlock; onClick: () => void }) {
  const { name, price, image, description, whatsappNumber, whatsappMessage } = block.settings;
  
  const handleOrder = () => {
    onClick();
    if (whatsappNumber) {
      const message = whatsappMessage || `Hi, I'm interested in ${name}`;
      const whatsappUrl = generateWhatsAppLink(whatsappNumber, message);
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <Card className="overflow-hidden">
      {image && (
        <div className="aspect-video w-full bg-muted relative">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{name || 'Product Name'}</h3>
          {price && (
            <span className="text-lg font-bold text-primary">
              {formatCurrency(price)}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}
        {whatsappNumber && (
          <Button 
            onClick={handleOrder}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Order via WhatsApp
          </Button>
        )}
      </div>
    </Card>
  );
}

function SocialRowBlock({ block, onClick }: { block: PageBlock; onClick: () => void }) {
  const { socials } = block.settings;
  
  if (!socials || socials.length === 0) {
    return null;
  }
  
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      {socials.map((social: any, index: number) => (
        <a
          key={index}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:bg-accent transition-colors"
        >
          {social.icon && <span>{social.icon}</span>}
          <span className="text-sm font-medium">{social.name}</span>
        </a>
      ))}
    </div>
  );
}

function EmbedBlock({ block }: { block: PageBlock }) {
  const { embedUrl, type } = block.settings;
  
  if (type === 'youtube' && embedUrl) {
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  
  if (type === 'tiktok' && embedUrl) {
    return (
      <div className="aspect-[9/16] max-w-sm mx-auto rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  
  return null;
}

function ContactFormBlock({ block }: { block: PageBlock }) {
  const { title } = block.settings;
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic anti-spam cooldown per session (15s)
    const cooldownKey = `webboss_lead_last_submit_${block.page_id}`;
    const last = Number(sessionStorage.getItem(cooldownKey) || 0);
    if (Date.now() - last < 15000) {
      toast.error('Please wait a few seconds before sending another message.');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const payload = {
        page_id: block.page_id,
        name: formData.name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        message: formData.message || null,
        source_url: window.location.href,
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase.from('leads').insert(payload);
      if (error) throw error;

      sessionStorage.setItem(cooldownKey, String(Date.now()));
      setSubmitted(true);
      setFormData({});
      toast.success('Message sent successfully');
    } catch (err) {
      console.error('Lead submit error:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
      <Card className="p-6 text-center">
        <div className="text-green-600 mb-2">
          <Mail className="h-8 w-8 mx-auto" />
        </div>
        <h3 className="font-semibold mb-2">Thanks for your message!</h3>
        <p className="text-sm text-muted-foreground">We'll get back to you soon.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">{title || 'Get in Touch'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            placeholder="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Input
            type="tel"
            placeholder="Phone (optional)"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Textarea
            placeholder="Message"
            value={formData.message || ''}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={4}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Card>
  );
}

function AnnouncementBlock({ block }: { block: PageBlock }) {
  const { text, emoji } = block.settings;
  
  return (
    <Card className="bg-primary/10 border-primary/20">
      <div className="p-4 text-center">
        {emoji && <span className="text-2xl mr-2">{emoji}</span>}
        <span className="font-medium">{text || 'Announcement'}</span>
      </div>
    </Card>
  );
}

function TextBlock({ block }: { block: PageBlock }) {
  const { content } = block.settings;
  
  return (
    <div className="prose prose-sm max-w-none">
      <p className="text-center text-muted-foreground">{content}</p>
    </div>
  );
}

function DividerBlock() {
  return <div className="border-t border-border my-2" />;
}