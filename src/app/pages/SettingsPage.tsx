import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, User, Shield, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FormField } from '../components/FormField';
import { Badge } from '../components/ui/badge';
import { createClient } from '../../lib/supabase';
import { useAuth } from '../App';
import type { Profile, Subscription } from '../../lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      setSubscription(subData);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone_e164: profile.phone_e164,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated!');
    } catch (error) {
      console.error('Save profile error:', error);
      toast.error('Failed to update profile');
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

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/app">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="font-semibold text-xl">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCard className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <FormField
                    label="Full Name"
                    value={profile?.full_name || ''}
                    onChange={(e) =>
                      setProfile({ ...profile!, full_name: e.target.value })
                    }
                  />
                  <FormField
                    label="Email"
                    type="email"
                    value={profile?.email || user?.email || ''}
                    disabled
                    hint="Email cannot be changed"
                  />
                  <FormField
                    label="Phone"
                    type="tel"
                    value={profile?.phone_e164 || ''}
                    onChange={(e) =>
                      setProfile({ ...profile!, phone_e164: e.target.value })
                    }
                  />
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Password</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Change your password to keep your account secure
                    </p>
                    <Button variant="outline">Change Password</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Plan</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription?.plan === 'pro'
                          ? 'Pro - ₦5,000/month'
                          : 'Free - ₦0/month'}
                      </p>
                    </div>
                    <Badge variant={subscription?.plan === 'pro' ? 'default' : 'secondary'}>
                      {subscription?.plan?.toUpperCase() || 'FREE'}
                    </Badge>
                  </div>

                  {subscription?.plan === 'free' && (
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Upgrade to Pro</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get unlimited pages, custom domains, and more
                      </p>
                      <Button asChild>
                        <Link to="/pricing">View Plans</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
