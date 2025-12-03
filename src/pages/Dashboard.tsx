import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/api/users';
import { listEvents } from '@/api/events';
import { EventCard } from '@/components/EventCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { deleteEvent } from '@/api/events';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await listEvents();
      setEvents(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load events',
        variant: 'destructive',
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Utilities ----------
  const safeNumber = (v: unknown) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  const round2 = (v: number) => Math.round(v * 100) / 100;

  // helper to get sensible splits array from event (defensive for different shapes)
  const getSplitsArray = (e: any): any[] => {
    if (!e) return [];
    if (Array.isArray(e.splits)) return e.splits;
    if (Array.isArray(e.split)) return e.split;
    if (Array.isArray(e.payments)) return e.payments;
    return [];
  };

  // ---------- Debug (safe, remove in prod) ----------
  useEffect(() => {
    console.log('Dashboard: user snapshot', {
      id: user?.id,
      debitorsCount: Array.isArray(user?.debitors) ? user!.debitors.length : 0,
      youOwe_server: user?.youOwe ?? null,
      owedToYou_server: user?.owedToYou ?? null,
      total_server: user?.total ?? null,
    });
  }, [user]);

  useEffect(() => {
    console.log('Dashboard: events snapshot', events.slice(0, 10));
  }, [events]);

  // ---------- Calculate youOwe ----------
  // Prefer server-provided user.youOwe if present and valid; otherwise compute from debitors
  const youOweComputed = useMemo(() => {
    const debs = Array.isArray(user?.debitors) ? user!.debitors : [];
    return debs
      .filter((d) => Boolean(d) && !d.settled && d.included)
      .reduce((sum, d) => sum + (safeNumber(d.debAmount) - safeNumber(d.amountPaid)), 0);
  }, [user?.debitors]);

  const youOweServer = (() => {
    const v = user?.youOwe;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  })();

  const youOweFinal = round2(youOweServer ?? youOweComputed);

  // ---------- Calculate owedToYou ----------
  // Prefer server-provided user.owedToYou if present; otherwise compute from events
  const owedToYouComputed = useMemo(() => {
    const evs = Array.isArray(events) ? events : [];
    return evs
      .filter((e: any) => {
        if (!e) return false;
        // find creator id on event (could be creatorId or creator.id)
        const creatorId = e.creatorId ?? e.creator?.id ?? null;
        return creatorId === user?.id && !e.cancelled;
      })
      .reduce((sum: number, e: any) => {
        const splits = getSplitsArray(e);
        const totalPaid = splits.reduce((s: number, sp: any) => s + safeNumber(sp?.amountPaid), 0);
        return sum + (safeNumber(e.total) - totalPaid);
      }, 0);
  }, [events, user?.id]);

  const owedToYouServer = (() => {
    const v = user?.owedToYou;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  })();

  const owedToYouFinal = round2(owedToYouServer ?? owedToYouComputed);

  // ---------- Compute total balance ----------
  // Use computed balance (owedToYou - youOwe). If server provides a total and you explicitly want it,
  // you can prefer user.total; currently we compute client-side to reflect latest items.
  const computedTotal = round2(owedToYouFinal - youOweFinal);

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.username}</p>
        </div>
        <Button
          onClick={() => navigate('/events/create')}
          className="shadow-glow hover:shadow-glow-lg transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${computedTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your overall balance (owedToYou − youOwe)
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${youOweFinal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding payments</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owed to You</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${owedToYouFinal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Expected payments</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Events</h2>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading events...</div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No events yet</p>
              <Button onClick={() => navigate('/events/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.slice(0, 6).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentUserId={user?.id ?? null}
                onDelete={async (id: number) => {
                  await deleteEvent(id);
                  setEvents((prev) => prev.filter((e) => e.id !== id));
                  toast({ title: 'Deleted', description: 'Event removed' });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
