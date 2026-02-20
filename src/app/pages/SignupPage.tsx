import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FormField } from '../components/FormField';
import { signUp } from '../../lib/auth';
import { toast } from 'sonner';

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const result = await signUp(formData.email, formData.password, formData.fullName);
      
      // Check if email confirmation is required
      if (result.user && !result.session) {
        // Email confirmation required
        toast.success('Account created! Please check your email to confirm your account.', {
          duration: 5000,
        });
        // Don't navigate, show confirmation message
        setSuccess(true);
        setErrors({ 
          general: '✅ Success! We sent a confirmation email to ' + formData.email + '. Please check your inbox and click the confirmation link to activate your account.' 
        });
      } else {
        // Auto-confirmed, proceed to onboarding
        toast.success('Account created successfully!');
        navigate('/app/onboarding');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
      setSuccess(false);
      setErrors({ general: error.message });
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
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Join thousands of creators on Web Boss
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Get started with your free account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div
                  role="alert"
                  aria-live="polite"
                  className={`p-3 text-sm rounded-md ${
                    success 
                      ? 'text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' 
                      : 'text-red-600 bg-red-50 dark:bg-red-950/20'
                  }`}
                >
                  {errors.general}
                </div>
              )}

              <FormField
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                error={errors.fullName}
                required
                disabled={loading}
                autoComplete="name"
              />

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
                hint="At least 6 characters"
                required
                disabled={loading}
                autoComplete="new-password"
              />

              <FormField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                required
                disabled={loading}
                autoComplete="new-password"
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>

            <p className="mt-4 text-xs text-center text-muted-foreground">
              By signing up, you agree to our{' '}
              <a href="#" className="underline">Terms</a> and{' '}
              <a href="#" className="underline">Privacy Policy</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}