import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/api/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, Mail, DollarSign, Save } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!username.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Username cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await updateUser(user.id, { username: username.trim() });
      await refreshUser();
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card className="shadow-glow-lg">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="transition-all focus:shadow-glow"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Balance
              </Label>
              <Input
                value={`$${user.total.toFixed(2)}`}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Automatically calculated from your events
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full shadow-glow hover:shadow-glow-lg transition-all"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-glow-lg">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
          <CardDescription>Your activity overview</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Events Participated</p>
            <p className="text-2xl font-bold">{user.events?.length || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Debts</p>
            <p className="text-2xl font-bold">
              {user.debitors?.filter(d => !d.settled && d.included).length || 0}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Settled Debts</p>
            <p className="text-2xl font-bold">
              {user.debitors?.filter(d => d.settled).length || 0}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
