import { useEffect, useState } from 'react';
import { listUsers, User } from '@/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users as UsersIcon, Mail, DollarSign } from 'lucide-react';

export default function Users() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <UsersIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground mt-1">People you can split expenses with</p>
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {users.map((user) => (
            <Card
              key={user.id}
              className="transition-all duration-300 hover:shadow-glow hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {user.username.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{user.username}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Balance:</span>
                  </div>
                  <Badge
                    variant={user.total >= 0 ? 'outline' : 'destructive'}
                    className={user.total >= 0 ? 'bg-primary/10 text-primary border-primary/20' : ''}
                  >
                    ${user.total.toFixed(2)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
