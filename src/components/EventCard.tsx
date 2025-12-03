// src/components/EventCard.tsx
import React, { useState } from 'react';
import { Calendar, User as UserIcon, DollarSign, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/api/users';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
  currentUserId?: number | null;
  onDelete?: (id: number) => Promise<void> | void;
}

export function EventCard({ event, currentUserId, onDelete }: EventCardProps) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleCardClick = () => navigate(`/events/${event.id}`);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    if (!confirm(`Delete "${event.title}" permanently?`)) return;
    try {
      setDeleting(true);
      await onDelete(event.id);
    } finally {
      setDeleting(false);
    }
  };

  const isCreator = typeof currentUserId === 'number' && currentUserId === Number(event.creatorId);

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-glow hover:-translate-y-1 relative"
      onClick={handleCardClick}
    >
      {isCreator && onDelete && (
        <button
          onClick={handleDeleteClick}
          aria-label="Delete event"
          title="Delete event"
          className="absolute right-3 top-3 z-30 inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium bg-card text-destructive border border-border hover:bg-muted/70"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg group-hover:text-primary transition-colors">{event.title}</CardTitle>
          {event.cancelled && <Badge variant="destructive">Cancelled</Badge>}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold text-foreground">₹{Number(event.total ?? 0).toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(event.createdAt), 'MMM dd, yyyy')}</span>
          </div>

          {event.splits && event.splits.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <span>{event.splits.length} participants</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
