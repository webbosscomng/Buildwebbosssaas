import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { createClient } from '../../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const supabase = createClient();

        // For OAuth / magic links / password recovery.
        // If there is no code to exchange, this will no-op or throw depending on provider.
        // We still proceed to check the session and route appropriately.
        try {
          // @ts-expect-error - exchangeCodeForSession exists in supabase-js v2
          await supabase.auth.exchangeCodeForSession(window.location.href);
        } catch {
          // ignore; session might already be set via other flow
        }

        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session?.user) {
          // If user is logged in, go to app (or onboarding if they are new).
          navigate('/app', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Authentication callback failed');
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-40 -z-10" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float -z-10" />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float -z-10"
        style={{ animationDelay: '1.5s' }}
      />

      {!error ? (
        <>
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            <div className="absolute inset-0 animate-pulse-glow bg-primary/20 rounded-full"></div>
          </div>
          <p className="text-muted-foreground mt-6 text-lg font-medium animate-pulse">Finishing sign-in…</p>
        </>
      ) : (
        <div className="max-w-md p-6 rounded-xl border bg-card">
          <h1 className="text-xl font-semibold mb-2">Sign-in failed</h1>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
            onClick={() => navigate('/login', { replace: true })}
          >
            Go to login
          </button>
        </div>
      )}
    </div>
  );
}
