'use client';

import { useEffect, useState } from 'react';
import { Trash2, Loader2, Mail, Phone } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

interface Message {
  id: string; name: string; email: string; phone: string | null;
  subject: string | null; message: string; status: string; createdAt: string;
}

const statusColors: Record<string, string> = {
  new: 'bg-pink-100 text-pink-600',
  read: 'bg-amber-100 text-amber-600',
  resolved: 'bg-pistachio-100 text-pistachio-600',
};

export default function MessagesClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/messages');
    setMessages(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/messages/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    fetchMessages();
  };

  if (loading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-pink-500" /></div>;

  if (messages.length === 0) {
    return <div className="rounded-2xl border border-dashed border-pink-200 py-16 text-center text-charcoal-600">No messages yet.</div>;
  }

  return (
    <div className="space-y-4">
      {messages.map((m) => (
        <div key={m.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-base font-bold text-charcoal">{m.subject || 'General Inquiry'}</p>
              <p className="text-sm text-charcoal-600">{m.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-charcoal-600">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{m.email}</span>
                {m.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{m.phone}</span>}
                <span>{formatDate(m.createdAt)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select value={m.status} onChange={(e) => updateStatus(m.id, e.target.value)} className={cn('rounded-full px-3 py-1 text-xs font-semibold focus:outline-none', statusColors[m.status])}>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="resolved">Resolved</option>
              </select>
              <button onClick={() => handleDelete(m.id)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <p className="mt-3 text-sm text-charcoal-600">{m.message}</p>
        </div>
      ))}
    </div>
  );
}