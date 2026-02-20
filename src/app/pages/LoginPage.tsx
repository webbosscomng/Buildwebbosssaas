import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Zap, Loader2, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FormField } from '../components/FormField';
import { signIn, resendConfirmationEmail } from '../../lib/auth';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as any)?.from?.pathname || '/app';

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    setResendingEmail(true);
    try {
      await resendConfirmationEmail(formData.email);
      toast.success('Confirmation email sent! Please check your inbox.');
      setShowResendConfirmation(false);
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error(error.message || 'Failed to resend confirmation email');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setShowResendConfirmation(false);
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if error is due to unconfirmed email
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
        setShowResendConfirmation(true);
        toast.error('Please confirm your email address to sign in');
        setErrors({ 
          general: 'Please confirm your email address. Check your inbox for the confirmation link.' 
        });
      } else {
        toast.error(error.message || 'Failed to sign in');
        setErrors({ general: error.message || 'Invalid email or password' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">Web Boss</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to continue
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-md">
                  {errors.general}
                </div>
              )}

              {showResendConfirmation && (
                <div className="p-3 text-sm bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-blue-900 dark:text-blue-100 mb-2">
                        Didn't receive the confirmation email?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendConfirmation}
                        disabled={resendingEmail}
                        className="text-xs"
                      >
                        {resendingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Resend confirmation email'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                required
                disabled={loading}
                autoComplete="email"
              />

              <FormField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                required
                disabled={loading}
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-sm">
                <Link 
                  to="/forgot-password" 
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}