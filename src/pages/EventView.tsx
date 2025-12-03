import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Event, User } from '@/api/users';
import { getEvent, cancelEvent, deleteEvent, addDebitor } from '@/api/events';
import { payDebitor } from '@/api/payments';
import { listUsers } from '@/api/users';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserPlus, XCircle, Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function EventView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; debitorId?: number; userId?: number; remaining?: number }>({ open: false });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [addParticipantModal, setAddParticipantModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadEvent();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // robust loadEvent: fetch event, then merge debitor metadata from /api/events/{id}/debitors if available
  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await getEvent(Number(id));

      try {
        // fetch debitors metadata that include userId + username
        const res = await fetch(`/api/events/${id}/debitors`, { credentials: 'same-origin' });
        if (res.ok) {
          const debitors = await res.json();
          const meta = new Map<number, any>();
          (debitors || []).forEach((d: any) => {
            const did = d.debitorId ?? d.id;
            if (did != null) meta.set(did, d);
          });

          const mergedSplits = (data.splits || []).map((s: any) => {
            const m = meta.get(s.id);
            if (m) {
              return {
                ...s,
                userId: m.userId ?? s.userId ?? s.user?.id,
                username: m.username ?? s.user?.username,
              };
            }
            return {
              ...s,
              userId: s.userId ?? s.user?.id,
              username: s.username ?? s.user?.username,
            };
          });

          const creatorUsername = (data as any).creatorUsername ?? (data.creator?.username);
          setEvent({ ...(data as any), splits: mergedSplits, creatorUsername });
        } else {
          const text = await res.text().catch(() => '<no body>');
          console.error('GET /api/events/{id}/debitors failed', res.status, text);
          setEvent(data);
        }
      } catch (e) {
        console.error('fetch /api/events/{id}/debitors error', e);
        setEvent(data);
      }
    } catch (error: any) {
      console.error('loadEvent failed', error);
      const msg = error?.message ?? 'Failed to load event';
      toast({ title: 'Error', description: String(msg), variant: 'destructive' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await listUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  // ---- Replace names with stable labels: prefer username -> You -> User #<id> ----
  const labelForUser = (userId: number | null | undefined) => {
    if (!userId) return 'User';
    if (user && user.id === userId) return 'You';
    return `User #${userId}`;
  };

  const displayUserLabel = (split: any) => {
    if (split?.username) return split.username;
    if (split?.user?.username) return split.user.username;
    const uid = split.userId ?? split.user?.id ?? null;
    return uid ? labelForUser(uid) : 'User';
  };

  const displayCreatorLabel = (ev: any) => {
    if (!ev) return 'User';
    if (ev.creatorUsername) return ev.creatorUsername;
    const creatorId = ev.creatorId ?? ev.creator?.id ?? null;
    if (creatorId && user && user.id === creatorId) return 'You';
    if (creatorId) return `User #${creatorId}`;
    return 'User';
  };

  // improved error handling for payment
  const handlePayment = async () => {
    if (!paymentModal.debitorId || !event || !user) return;

    const amount = Number(String(paymentAmount).replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Validation Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    setBusy(true);
    try {
      await payDebitor({
        debitorId: paymentModal.debitorId,
        payerUserId: user.id,
        amount,
      });
      toast({ title: 'Success', description: 'Payment recorded' });
      setPaymentModal({ open: false });
      setPaymentAmount('');
      await loadEvent();
    } catch (err: any) {
      console.error('payDebitor failed', err);
      let serverMsg: string | null = null;
      if (err?.response?.data) serverMsg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      else if (err?.response?.statusText) serverMsg = err.response.statusText;
      else if (err?.message) serverMsg = err.message;
      toast({
        title: 'Error',
        description: serverMsg ? `Failed to record payment: ${serverMsg}` : 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  // improved error handling for add participant
  const handleAddParticipant = async () => {
    if (!event || !selectedUserId) return;
    setBusy(true);
    try {
      await addDebitor(event.id, { userId: Number(selectedUserId), included: true });
      toast({ title: 'Success', description: 'Participant added' });
      setAddParticipantModal(false);
      setSelectedUserId('');
      await loadEvent();
    } catch (err: any) {
      console.error('addDebitor failed', err);
      let serverMsg: string | null = null;
      if (err?.response?.data) serverMsg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      else if (err?.message) serverMsg = err.message;
      toast({
        title: 'Error',
        description: serverMsg ? `Failed to add participant: ${serverMsg}` : 'Failed to add participant',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!event) return;
    setBusy(true);
    try {
      await cancelEvent(event.id);
      toast({ title: 'Success', description: 'Event cancelled' });
      await loadEvent();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel event', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setBusy(true);
    try {
      await deleteEvent(event.id);
      toast({ title: 'Success', description: 'Event deleted' });
      setConfirmDeleteOpen(false);
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!event) return null;

  const eventCreatorId = (event as any).creatorId ?? (event as any).creator?.id ?? null;
  const isCreator = eventCreatorId === user?.id;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in space-y-6">
      <Button variant="ghost" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="shadow-glow-lg">
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Created by {displayCreatorLabel(event)}</span>
                <span>•</span>
                <span>{format(new Date((event as any).createdAt), 'MMM dd, yyyy')}</span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {event.cancelled && <Badge variant="destructive">Cancelled</Badge>}
              <Badge className="text-lg px-3 py-1">{currencyFormatter.format(Number(event.total ?? 0))}</Badge>
            </div>
          </div>

          {/* removed top-right delete - moved to bottom */}
        </CardHeader>

        <CardContent className="space-y-4">
          {isCreator && !event.cancelled && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddParticipantModal(true)} className="hover:shadow-glow" disabled={busy}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Participant
              </Button>
              <Button variant="outline" onClick={handleCancel} className="hover:shadow-glow" disabled={busy}>
                <XCircle className="mr-2 h-4 w-4" /> Cancel Event
              </Button>
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold mb-4">Participants & Splits</h3>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {event.splits?.map((split: any) => {
                    const debAmount = Number(split.debAmount ?? 0);
                    const amountPaid = Number(split.amountPaid ?? 0);
                    const remaining = debAmount - amountPaid;

                    const splitUserId = split.userId ?? split.user?.id ?? null;
                    const displayLabel = displayUserLabel(split);

                    return (
                      <TableRow key={split.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{displayLabel}</TableCell>
                        <TableCell className="text-right">{currencyFormatter.format(debAmount)}</TableCell>
                        <TableCell className="text-right">{currencyFormatter.format(amountPaid)}</TableCell>
                        <TableCell className="text-right">
                          <span className={remaining > 0 ? 'text-destructive' : 'text-primary'}>{currencyFormatter.format(remaining)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {split.settled ? (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              <Check className="mr-1 h-3 w-3" /> Settled
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!split.settled && remaining > 0 && (
                            <Button size="sm" onClick={() => {
                              setPaymentModal({ open: true, debitorId: split.id, userId: splitUserId, remaining });
                              setPaymentAmount(String(remaining.toFixed(2)));
                            }} className="shadow-glow hover:shadow-glow-lg" disabled={busy}>
                              Pay
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* delete button moved here - bottom of card */}
          {isCreator && (
            <div className="flex justify-end mt-4">
              <Button variant="destructive" onClick={() => setConfirmDeleteOpen(true)} disabled={busy} className="px-4 py-2">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Event
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={paymentModal.open} onOpenChange={(open) => setPaymentModal({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Enter payment amount for {paymentModal.userId ? displayUserLabel({ userId: paymentModal.userId, username: undefined, user: undefined }) : 'User'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="transition-all focus:shadow-glow" />
              {paymentModal.remaining != null && <p className="text-sm text-muted-foreground">Remaining: {currencyFormatter.format(paymentModal.remaining)}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModal({ open: false })} disabled={busy}>Cancel</Button>
            <Button onClick={handlePayment} className="shadow-glow" disabled={busy}>{busy ? 'Recording...' : 'Record Payment'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Participant Modal */}
      <Dialog open={addParticipantModal} onOpenChange={setAddParticipantModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>Select a user to add to this event</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Label>User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="transition-all focus:shadow-glow"><SelectValue placeholder="Select a user" /></SelectTrigger>
              <SelectContent>
                {users
                  .filter(u => !((event.splits || []).some((s: any) => (s.userId ?? s.user?.id) === u.id)))
                  .map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.username}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddParticipantModal(false)} disabled={busy}>Cancel</Button>
            <Button onClick={handleAddParticipant} className="shadow-glow" disabled={busy}>{busy ? 'Adding...' : 'Add Participant'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>This will permanently delete <strong>{event.title}</strong> and all its splits.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} disabled={busy}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busy}>{busy ? 'Deleting...' : 'Delete event'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
