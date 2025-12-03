import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { openGoogleLogin } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

        {/* LEFT — Decorative Panel */}
        <div className="hidden md:flex md:col-span-7 lg:col-span-8 items-center justify-center">
          <div className="relative w-full max-w-3xl h-[380px] rounded-3xl overflow-hidden bg-gradient-to-br from-surface to-surface/90 border border-border p-6">

            {/* Soft blobs */}
            <div className="absolute -left-10 -top-16 w-72 h-72 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl opacity-80 animate-[spin_30s_linear_infinite]"></div>
            <div className="absolute right-6 -bottom-20 w-80 h-80 rounded-full bg-gradient-to-tr from-secondary/24 to-transparent blur-3xl opacity-70 animate-[spin_40s_linear_infinite]"></div>

            {/* Pattern content */}
            <div className="relative z-10 grid grid-cols-3 gap-4 h-full place-items-center">

              {/* Friends circles */}
              <div className="col-span-2 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground font-bold shadow-sm animate-pulse">
                    A
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-300 flex items-center justify-center text-white font-bold shadow-sm animate-bounce">
                    B
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-300 flex items-center justify-center text-white font-bold shadow-sm animate-pulse">
                    C
                  </div>
                  <div className="ml-4 text-sm text-muted-foreground">Friends</div>
                </div>

                {/* Example card */}
                <div className="mt-3 p-4 rounded-2xl bg-background/60 border border-border flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Shared dinner</div>
                    <div className="text-xs text-muted-foreground">You split ₹1,200 — Alex owes ₹300</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">₹300</div>
                    <div className="text-xs text-muted-foreground">pending</div>
                  </div>
                </div>

                {/* Split requests */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-primary/6 to-secondary/6 border border-border flex items-center gap-3 mt-2">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M6 6h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M6 18h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 4v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <div className="text-sm">
                    <div className="font-medium">Split requests</div>
                    <div className="text-xs text-muted-foreground">3 requests awaiting</div>
                  </div>
                </div>
              </div>

              {/* Money panel */}
              <div className="flex flex-col items-center justify-center gap-4">

                <div className="w-28 h-36 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/6 border border-primary/30 flex flex-col items-center justify-center shadow-glow">
                  <div className="text-xs text-muted-foreground">Your balance</div>
                  <div className="mt-2 font-bold text-lg">₹1,250</div>
                  <div className="text-[11px] text-muted-foreground">owed to you</div>
                </div>

                <div className="relative w-28 h-28">
                  <div className="absolute left-0 top-0 w-14 h-14 rounded-full bg-primary/40 blur-md animate-pulse"></div>
                  <div className="absolute right-0 bottom-0 w-12 h-12 rounded-full bg-emerald-400/40 blur-md animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Login Card */}
        <div className="md:col-span-5 lg:col-span-4">
          <Card className="p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="text-left space-y-3">
              <div>
                <CardTitle className="text-3xl font-extrabold tracking-tight">
                  Welcome to <span className="text-primary">SplitWise</span>
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Smart expense sharing with your favourite people.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="mt-4 space-y-6">
              <Button
                onClick={openGoogleLogin}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 flex items-center justify-center"
                size="lg"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92..." />
                </svg>
                Continue with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                By continuing, you accept our Terms & Privacy policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
