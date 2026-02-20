import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { resetPassword } from '../../lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await resetPassword(email.trim());
      if (!res.success) throw new Error(res.error || 'Failed to send reset email');
      setMessage('Password reset link sent. Please check your email.');
    } catch (err: any) {
      setError(err?.message || 'Unable to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-2">Forgot password</h1>
        <p className="text-sm text-muted-foreground mb-6">Enter your email and we’ll send a reset link.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {message && (
            <div role="status" aria-live="polite" className="p-3 text-sm text-emerald-700 bg-emerald-50 rounded-md">
              {message}
            </div>
          )}

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
