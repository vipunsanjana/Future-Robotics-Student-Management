'use client';

import { useState, Suspense } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  ShieldCheck,
  Sparkles,
  Cpu,
  Code2,
  Heart,
} from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    signIn('google', { callbackUrl });
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-primary/10">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* =========================================================================
          HEADER SECTION
         ========================================================================= */}
      <header className="z-20 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-background/80 p-1 shadow-md shadow-primary/10 ring-1 ring-border/60 backdrop-blur-md">
              <Image
                src="/Logo.jpeg"
                alt="Academy of Future Robotics Logo"
                width={44}
                height={44}
                className="h-full w-full rounded-lg object-cover"
                priority
              />
            </div>
            <div>
              <span className="block text-base font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent sm:text-lg">
                Academy of Future Robotics
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN LOGIN SECTION
         ========================================================================= */}
      <main className="z-10 flex flex-grow items-center justify-center p-4 my-8">
        <div className="w-full max-w-md space-y-6">
          {/* Main Logo & Title Banner */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-background/80 p-1.5 shadow-2xl shadow-primary/20 backdrop-blur-md ring-1 ring-border/50 transition-transform duration-300 hover:scale-105">
              <Image
                src="/Logo.jpeg"
                alt="Academy of Future Robotics Logo"
                width={80}
                height={80}
                className="h-full w-full rounded-xl object-cover"
                priority
              />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome Back
              </h1>
              <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Empowering the next generation of robotics engineers
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-border/60 bg-card/80 shadow-2xl backdrop-blur-xl transition-all">
            <CardHeader className="space-y-1.5 text-center">
              <CardTitle className="text-xl font-bold tracking-tight">Sign In</CardTitle>
              <CardDescription className="text-sm">
                Use your institutional Google account to enter the dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <Button
                variant="outline"
                size="lg"
                className="group relative w-full overflow-hidden border-border/80 bg-background/50 font-medium hover:bg-accent/50 hover:border-primary/50 transition-all duration-300 shadow-sm"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                ) : (
                  <svg
                    className="mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span className="text-sm font-semibold">
                  {googleLoading ? 'Connecting...' : 'Sign in with Google'}
                </span>
              </Button>

              <div className="flex items-center justify-center gap-2 pt-2 text-xs font-medium text-muted-foreground/80">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Secured with OAuth 2.0 & Encryption</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* =========================================================================
          FOOTER SECTION (Taller height with increased padding)
         ========================================================================= */}
      <footer className="z-20 w-full border-t border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row sm:px-8 lg:px-12">
          {/* Left Copyright */}
          <p className="text-xs text-muted-foreground sm:text-sm">
            © {new Date().getFullYear()}{' '}
            <span className="font-semibold text-foreground">Academy of Future Robotics</span>. All rights reserved.
          </p>

          {/* Center / Right Developer Credit */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Code2 className="h-4 w-4 text-primary" />
            <span>Developed with</span>
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 animate-pulse" />
            <span>by</span>
            <span className="font-bold text-foreground hover:text-primary transition-colors">
              Vipun Sanjana
            </span>
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary border border-primary/20">
              Software Engineer
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
