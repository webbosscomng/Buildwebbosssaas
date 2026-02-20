import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, ArrowLeft, Check, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FormField } from '../components/FormField';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { createClient } from '../../lib/supabase';
import { checkHandleAvailability } from '../../lib/api';
import { useAuth } from '../App';
import { isValidHandle, formatPhoneForWhatsApp } from '../../lib/utils';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Choose Your Goal', description: 'What will you use your page for?' },
  { id: 2, title: 'Claim Your Handle', description: 'Your unique web address' },
  { id: 3, title: 'WhatsApp Number', description: 'Connect with your audience' },
  { id: 4, title: 'Choose a Theme', description: 'Pick your style' },
  { id: 5, title: 'Add Your First Links', description: 'Get started with content' },
];

const GOALS = [
  { id: 'creator', label: 'Creator', emoji: '🎨', description: 'Share your content' },
  { id: 'business', label: 'Business', emoji: '🏪', description: 'Sell products' },
  { id: 'coach', label: 'Coach', emoji: '💼', description: 'Offer services' },
];

const THEMES = [
  { id: 'clean', label: 'Clean', preview: 'bg-white border-2 border-slate-200' },
  { id: 'midnight', label: 'Midnight', preview: 'bg-slate-900 border-2 border-slate-700' },
  { id: 'vibrant', label: 'Vibrant', preview: 'bg-gradient-to-br from-pink-500 to-orange-500' },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState({
    goal: '',
    handle: '',
    whatsapp: '',
    theme: 'clean',
    title: '',
    bio: '',
    firstLink: { title: '', url: '' },
  });
  
  const [handleStatus, setHandleStatus] = useState<{
    checking: boolean;
    available: boolean;
    message: string;
  }>({ checking: false, available: false, message: '' });

  const progress = (step / STEPS.length) * 100;

  const checkHandle = async (handle: string) => {
    if (!handle) {
      setHandleStatus({ checking: false, available: false, message: '' });
      return;
    }

    if (!isValidHandle(handle)) {
      setHandleStatus({ 
        checking: false, 
        available: false, 
        message: 'Handle must be 3-30 characters (lowercase, numbers, underscores only)' 
      });
      return;
    }

    setHandleStatus({ checking: true, available: false, message: 'Checking...' });

    try {
      const result = await checkHandleAvailability(handle);
      
      if (result.available) {
        setHandleStatus({ checking: false, available: true, message: 'Available!' });
      } else {
        const reasons: Record<string, string> = {
          reserved: 'This handle is reserved',
          taken: 'This handle is already taken',
          invalid_format: 'Invalid handle format',
        };
        setHandleStatus({ 
          checking: false, 
          available: false, 
          message: reasons[result.reason || ''] || 'Not available' 
        });
      }
    } catch (error) {
      console.error('Handle check error:', error);
      
      // Check if error is due to missing tables
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST205') {
        setHandleStatus({ 
          checking: false, 
          available: false, 
          message: '⚠️ Database not set up. Please run schema.sql in Supabase SQL Editor. See DATABASE-SETUP.md for instructions.' 
        });
        toast.error('Database tables not found. Check console for setup instructions.');
      } else {
        setHandleStatus({ checking: false, available: false, message: 'Error checking handle' });
      }
    }
  };

  const handleNext = async () => {
    if (step === 2 && !handleStatus.available) {
      toast.error('Please choose an available handle');
      return;
    }

    if (step === STEPS.length) {
      await handleFinish();
      return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const supabase = createClient();

      // Create page
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .insert({
          owner_id: user.id,
          handle: data.handle,
          title: data.title || 'My Page',
          bio: data.bio || '',
          theme_preset: data.theme,
          is_published: false,
        })
        .select()
        .single();

      if (pageError) {
        console.error('Page creation error:', pageError);
        
        // Check if error is due to missing tables
        if (pageError.code === 'PGRST205' || pageError.message?.includes('table')) {
          throw new Error('⚠️ Database not set up. Please run schema.sql in Supabase SQL Editor. See DATABASE-SETUP.md in the project root for complete setup instructions.');
        }
        
        throw new Error(pageError.message);
      }

      // Create default blocks
      const blocks = [];

      // WhatsApp CTA
      if (data.whatsapp) {
        blocks.push({
          page_id: pageData.id,
          type: 'whatsapp_cta',
          settings: {
            phone: data.whatsapp,
            buttonText: 'Chat on WhatsApp',
          },
          sort_order: 0,
          is_enabled: true,
        });
      }

      // First link
      if (data.firstLink.title && data.firstLink.url) {
        blocks.push({
          page_id: pageData.id,
          type: 'link',
          settings: {
            title: data.firstLink.title,
            url: data.firstLink.url,
            icon: '🔗',
          },
          sort_order: 1,
          is_enabled: true,
        });
      }

      if (blocks.length > 0) {
        const { error: blocksError } = await supabase
          .from('page_blocks')
          .insert(blocks);

        if (blocksError) {
          console.error('Blocks error:', blocksError);
        }
      }

      toast.success('Page created successfully!');
      navigate(`/app/pages/${pageData.id}/editor`);
    } catch (error: any) {
      console.error('Create page error:', error);
      toast.error(error.message || 'Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!data.goal;
      case 2: return handleStatus.available;
      case 3: return true; // WhatsApp is optional
      case 4: return !!data.theme;
      case 5: return true; // Links are optional
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {step} of {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {STEPS[step - 1].title}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step - 1].title}</CardTitle>
            <CardDescription>{STEPS[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Goal */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setData({ ...data, goal: goal.id })}
                    className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                      data.goal === goal.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-4xl mb-3">{goal.emoji}</div>
                    <h3 className="font-semibold mb-1">{goal.label}</h3>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                    {data.goal === goal.id && (
                      <Check className="h-5 w-5 text-primary mt-2 mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Handle */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <FormField
                    label="Your Handle"
                    value={data.handle}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setData({ ...data, handle: value });
                      checkHandle(value);
                    }}
                    hint={`Your page will be available at webboss.com.ng/@${data.handle || 'yourhandle'}`}
                    error={!handleStatus.available && handleStatus.message ? handleStatus.message : undefined}
                    disabled={loading}
                  />
                  {handleStatus.available && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      {handleStatus.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: WhatsApp */}
            {step === 3 && (
              <div className="space-y-4">
                <FormField
                  label="WhatsApp Number"
                  type="tel"
                  value={data.whatsapp}
                  onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
                  placeholder="0801 234 5678"
                  hint="Nigerian numbers starting with 0 will be automatically formatted"
                />
                <div className="bg-muted p-4 rounded-lg flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Why WhatsApp?</p>
                    <p className="text-sm text-muted-foreground">
                      Let visitors reach you directly on WhatsApp - the easiest way to connect in Nigeria
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Theme */}
            {step === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setData({ ...data, theme: theme.id })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      data.theme === theme.id
                        ? 'border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className={`h-32 rounded-lg mb-3 ${theme.preview}`}></div>
                    <h3 className="font-semibold">{theme.label}</h3>
                    {data.theme === theme.id && (
                      <Check className="h-5 w-5 text-primary mt-2 mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 5: First Links */}
            {step === 5 && (
              <div className="space-y-4">
                <FormField
                  label="Page Title"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="My Awesome Page"
                />
                <FormField
                  label="Bio"
                  value={data.bio}
                  onChange={(e) => setData({ ...data, bio: e.target.value })}
                  placeholder="Tell visitors about yourself"
                />
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-4">Add Your First Link (Optional)</h3>
                  <div className="space-y-3">
                    <FormField
                      label="Link Title"
                      value={data.firstLink.title}
                      onChange={(e) => 
                        setData({ 
                          ...data, 
                          firstLink: { ...data.firstLink, title: e.target.value } 
                        })
                      }
                      placeholder="My Website"
                    />
                    <FormField
                      label="URL"
                      type="url"
                      value={data.firstLink.url}
                      onChange={(e) => 
                        setData({ 
                          ...data, 
                          firstLink: { ...data.firstLink, url: e.target.value } 
                        })
                      }
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {step === STEPS.length ? 'Create Page' : 'Continue'}
                {step < STEPS.length && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}