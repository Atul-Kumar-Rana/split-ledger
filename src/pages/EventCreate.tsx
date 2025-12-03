import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { listUsers, getUserByUsername, User } from '@/api/users';
import { createEvent } from '@/api/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function EventCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  // search-by-username state
  const [searchName, setSearchName] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async () => {
    try {
      const data = await listUsers();
      setUsers(data.filter(u => u.id !== user?.id));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    }
  };

  const handleUserToggle = (userId: number) => {
    setSelectedUsers(prev => {
      const n = new Set(prev);
      if (n.has(userId)) n.delete(userId);
      else n.add(userId);
      return n;
    });
  };

  // Add participant by username
  const handleAddByUsername = async () => {
    const name = searchName.trim();
    if (!name) {
      toast({ title: 'Validation', description: 'Enter a username', variant: 'destructive' });
      return;
    }

    setSearching(true);
    try {
      const found = await getUserByUsername(name);
      if (!found) {
        toast({ title: 'Not found', description: 'User not found', variant: 'destructive' });
        return;
      }

      if (found.id === user?.id) {
        toast({ title: 'Info', description: 'You are already included' });
        return;
      }

      // if already selected
      if (selectedUsers.has(found.id)) {
        toast({ title: 'Info', description: 'User already added' });
        return;
      }

      // add to users list if not present so it shows in the list
      setUsers(prev => (prev.some(u => u.id === found.id) ? prev : [...prev, found]));

      // select the user
      setSelectedUsers(prev => {
        const n = new Set(prev);
        n.add(found.id);
        return n;
      });

      setSearchName('');
      toast({ title: 'Added', description: `${found.username} added to participants` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to search user', variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !total || parseFloat(total) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields correctly',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUsers.size === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one participant',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const participants = [
        { userId: user.id, included: true },
        ...Array.from(selectedUsers).map(userId => ({ userId, included: true }))
      ];

      const event = await createEvent({
        title: title.trim(),
        creatorId: user.id,
        total: parseFloat(total),
        participants,
      });

      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
      navigate(`/events/${event.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const perPersonAmount = total && selectedUsers.size > 0
    ? (parseFloat(total) / (selectedUsers.size + 1)).toFixed(2)
    : '0.00';

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="shadow-glow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Event</CardTitle>
          <CardDescription>
            Split an expense with your friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="e.g., Dinner at Restaurant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="transition-all focus:shadow-glow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total Amount (₹)</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="transition-all focus:shadow-glow"
              />
            </div>

            {/* Add by username */}
            <div className="space-y-3">
              <Label>Add participant by username</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Type username and press Add"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddByUsername(); } }}
                />
                <Button type="button" onClick={handleAddByUsername} disabled={searching}>
                  {searching ? 'Searching...' : 'Add'}
                </Button>
              </div>

              <div className="mt-2 text-sm text-muted-foreground">Or select from the list below</div>

              <div className="space-y-2 max-h-60 overflow-y-auto rounded-lg border border-border p-4">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No other users available</p>
                ) : (
                  users.map((u) => (
                    <div key={u.id} className="flex items-center space-x-2 hover:bg-muted/50 p-2 rounded transition-colors">
                      <Checkbox
                        id={`user-${u.id}`}
                        checked={selectedUsers.has(u.id)}
                        onCheckedChange={() => handleUserToggle(u.id)}
                      />
                      <label
                        htmlFor={`user-${u.id}`}
                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {u.username}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {total && selectedUsers.size > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Per person (equal split):</span>
                    <span className="text-lg font-bold text-primary">${perPersonAmount}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Split between {selectedUsers.size + 1} people
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 shadow-glow hover:shadow-glow-lg"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
