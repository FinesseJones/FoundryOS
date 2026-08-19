import React, { useState } from 'react';
import { ApprovalManager, ApprovalRequest } from '../core/automation';
import { ViewTab } from './Navbar';

interface ApprovalsViewProps {
  approvalManager: ApprovalManager;
  businessId: string;
  setActiveTab: (tab: ViewTab) => void;
  onApprovalResolved: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  approvalManager,
  businessId,
  setActiveTab,
  onApprovalResolved,
}) => {
  const [reviewNote, setReviewNote] = useState('Approved by Executive Brand Manager');
  const pendingRequests: ApprovalRequest[] = approvalManager.listPendingRequests(businessId);

  const handleDecision = (requestId: string, decision: 'approved' | 'rejected') => {
    approvalManager.resolveRequest(requestId, decision, 'user/executive@company.com', reviewNote);
    onApprovalResolved();
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Human-in-the-Loop Approvals — <span className="text-gradient">Approval Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Review high-risk actions, brand voice compliance flags, and staged campaign outputs.
          </p>
        </div>
      </div>

      {pendingRequests.length > 0 ? (
        <div className="space-y-6">
          {pendingRequests.map((req) => (
            <div key={req.id} className="glass-card p-6 space-y-6 border-amber-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="badge-pending text-xs px-3 py-1 rounded-full font-bold uppercase">
                    Pending Human Review
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Agent: {req.proposedByAgent}</span>
                </div>
                <span className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleTimeString()}</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-100 text-lg">{req.actionTitle}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{req.description}</p>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <label className="font-semibold text-slate-300">Executive Review Note</label>
                <input
                  type="text"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/90 border border-white/10 px-4 py-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleDecision(req.id, 'rejected')}
                  className="rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-6 py-2.5 text-xs font-bold text-rose-400 transition-colors"
                >
                  Reject & Request Revision ✕
                </button>
                <button
                  onClick={() => handleDecision(req.id, 'approved')}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
                >
                  Approve for Staging ✓
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center space-y-4 border-emerald-500/30">
          <div className="text-4xl text-emerald-400">✓</div>
          <h3 className="text-lg font-bold text-slate-100">All Clear — No Pending Approvals</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All AI agent actions and content drafts have been approved or staged for delivery.
          </p>
          <button
            onClick={() => setActiveTab('generate')}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-xs font-bold text-white transition-colors"
          >
            Create New Content Draft
          </button>
        </div>
      )}
    </div>
  );
};
