"use client";

import React, { useState } from 'react';
import {
  CreditCard,
  Send,
  Sparkles,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Filter,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  clientName: string;
  phone: string;
  amount: number;
  description: string;
  status: 'PAID' | 'PENDING' | 'EXPIRED';
  date: string;
  method?: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-101', clientName: 'Marcus Vance', phone: '(310) 849-2041', amount: 2500, description: 'Virtual Soundstage Stage 1 Deposit (Thursday Shoot)', status: 'PAID', date: 'Today, 10:24 AM', method: 'Apple Pay' },
  { id: 'tx-102', clientName: 'Elena Rostova', phone: '(415) 620-8819', amount: 4800, description: 'Brand-First AI Architecture Setup Retainer', status: 'PENDING', date: 'Today, 9:50 AM' },
  { id: 'tx-103', clientName: 'Summit Media', phone: '(212) 509-3128', amount: 12000, description: '4K Commercial Post-Production Master Package', status: 'PAID', date: 'Yesterday', method: 'Credit Card (Stripe)' },
  { id: 'tx-104', clientName: 'Aero Dynamics', phone: '(512) 401-9923', amount: 1500, description: 'Website Redesign & Onboarding Consultation', status: 'PAID', date: '3 days ago', method: 'Google Pay' },
];

export const PodiumPaymentsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSendPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !amount) return;

    setIsSending(true);
    setTimeout(() => {
      const newTx: Transaction = {
        id: `tx-${Date.now().toString().slice(-4)}`,
        clientName,
        phone: clientPhone,
        amount: parseFloat(amount),
        description: description || 'Project Services Invoice',
        status: 'PENDING',
        date: 'Just now',
      };

      setTransactions((prev) => [newTx, ...prev]);
      setIsSending(false);
      setClientName('');
      setClientPhone('');
      setAmount('');
      setDescription('');
      toast.success(`💳 $${parseFloat(amount).toLocaleString()} Text-to-Pay link dispatched to ${clientPhone}!`, { icon: '💸' });
    }, 700);
  };

  const totalCollected = transactions.filter((t) => t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);
  const totalPending = transactions.filter((t) => t.status === 'PENDING').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="h-full flex flex-col font-sans bg-[#080c16] text-slate-100 p-4 lg:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-white font-serif">Text-to-Pay & Fast Invoicing</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
              PODIUM PAYMENTS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Collect client retainers and project invoices via 1-click SMS payment links (Apple Pay, Google Pay, Cards)
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Collected (This Month)</span>
          <p className="text-2xl font-black text-emerald-400">${totalCollected.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-300/80 font-mono">● 100% Settled into Stripe / Bank</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Pending Invoices</span>
          <p className="text-2xl font-black text-amber-400">${totalPending.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-mono">1 active payment link awaiting tap</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Average Payment Speed</span>
          <p className="text-2xl font-black text-indigo-400">4.2 Minutes</p>
          <p className="text-[10px] text-emerald-400 font-mono">85% faster than 30-day net invoices</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Create Payment Link (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-gradient-to-b from-[#0e1628] to-[#090d16] border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white font-serif">Create New SMS Payment Link</h3>
          </div>
          <p className="text-xs text-slate-300">
            Generate an instant payment checkout link and text it to your client's smartphone.
          </p>

          <form onSubmit={handleSendPayment} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Client Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Client Mobile Phone</label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2500.00"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase">Description / Invoice Memo</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Stage 1 Soundstage Deposit"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>{isSending ? 'Sending SMS...' : 'Dispatch Text-to-Pay Link'}</span>
            </button>
          </form>
        </div>

        {/* Right: Transactions Ledger (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white font-serif">Recent Text-to-Pay Transactions</h3>
            <span className="text-[10px] font-mono text-slate-400">Live Stripe Ledger</span>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-white">{tx.clientName}</h4>
                    <span
                      className={`px-2 py-0.2 rounded-full font-mono text-[9px] font-bold ${
                        tx.status === 'PAID'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">{tx.description}</p>
                  <p className="text-[10px] font-mono text-slate-400">
                    {tx.phone} • {tx.date} {tx.method ? `via ${tx.method}` : ''}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-base font-black text-white font-mono">${tx.amount.toLocaleString()}</p>
                  {tx.status === 'PAID' ? (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3" /> Settled
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> SMS Delivered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
