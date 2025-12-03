// src/pages/Transactions.tsx  (replace your current file)
import { useEffect, useState } from 'react';
import { Transaction, listTransactions } from '@/api/payments';
import { listUsers, User } from '@/api/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ArrowRight, Receipt } from 'lucide-react';

const rupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export default function Transactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txData, userData] = await Promise.all([listTransactions(), listUsers()]);
      setTransactions(Array.isArray(txData) ? txData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error('Failed to load transactions or users', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
      setTransactions([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: number | undefined | null) => {
    if (userId == null) return 'Unknown';
    const u = users.find((x) => x.id === userId);
    return u?.username ?? `User #${userId}`;
  };

  const formatAmount = (amt: number | string | null | undefined) => {
    if (amt == null) return rupee.format(0);
    const n = typeof amt === 'number' ? amt : Number(String(amt));
    return rupee.format(Number.isFinite(n) ? n : 0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Receipt className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground mt-1">Payment history and activity</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const fromName = getUserName((transaction as any).fromUser);
            const toName = getUserName((transaction as any).toUser);
            const amountDisplay = formatAmount((transaction as any).amount);
            const timestamp = transaction.ts ? format(new Date(transaction.ts), 'MMM dd, yyyy • HH:mm') : '';
            const note = (transaction as any).note;

            return (
              <Card key={transaction.id} className="transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-lg">Transaction #{transaction.id}</CardTitle>
                    <Badge className="text-base px-3">{amountDisplay}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {String(fromName).slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{fromName}</span>
                        <span className="text-xs text-muted-foreground ml-2">paid</span>
                      </div>

                      <ArrowRight className="h-5 w-5 text-muted-foreground" />

                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="font-medium">{toName}</span>
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {String(toName).slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-3">
                      <span>{timestamp}</span>
                      {note ? <span className="italic">"{note}"</span> : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
