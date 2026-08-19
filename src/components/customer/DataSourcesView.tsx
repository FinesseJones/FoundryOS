import React, { useState } from 'react';
import { DataSourceRecord, DataSourceType } from '../../core/ingestion/data-source-service';

interface DataSourcesViewProps {
  sources: DataSourceRecord[];
  onAddSource?: (type: DataSourceType, name: string) => void;
  onDisconnectSource?: (sourceId: string) => void;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({
  sources,
  onAddSource,
  onDisconnectSource,
}) => {
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<DataSourceType>('WEBSITE');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSourceName.trim() && onAddSource) {
      onAddSource(newSourceType, newSourceName.trim());
      setNewSourceName('');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 border border-indigo-500/30 text-xs font-semibold text-indigo-400">
            <span>Unified Knowledge Sources</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-2">
            Data Source <span className="text-gradient">Management</span>
          </h1>
          <p className="text-xs text-slate-400">
            Connect websites, PDFs, DOCX documents, CSV spreadsheets, and API feeds into your Business DNA profile.
          </p>
        </div>
      </div>

      {/* Add New Source Form */}
      <form onSubmit={handleAdd} className="glass-card p-6 space-y-4 border-indigo-500/30">
        <h3 className="font-bold text-slate-100 text-sm">Add New Knowledge Source</h3>
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={newSourceType}
            onChange={(e) => setNewSourceType(e.target.value as DataSourceType)}
            className="rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            <option value="WEBSITE">Website URL</option>
            <option value="DOCUMENT">PDF Document</option>
            <option value="CSV">CSV File</option>
            <option value="SPREADSHEET">XLSX Spreadsheet</option>
            <option value="API">API Integration</option>
          </select>

          <input
            type="text"
            placeholder="e.g. https://acme.com or Product_Catalog.pdf"
            value={newSourceName}
            onChange={(e) => setNewSourceName(e.target.value)}
            className="flex-1 min-w-[240px] rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-bold text-xs text-white shadow hover:opacity-95 transition-opacity"
          >
            + Connect Source
          </button>
        </div>
      </form>

      {/* Sources Matrix Table */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold text-slate-100 text-base border-b border-white/10 pb-3">
          Registered Data Sources ({sources.length})
        </h3>

        {sources.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No knowledge sources connected yet. Add a website or document above to begin ingestion.
          </div>
        ) : (
          <div className="divide-y divide-white/10 text-xs">
            {sources.map((s) => (
              <div key={s.id} className="py-3.5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">{s.sourceName}</span>
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                      {s.sourceType}
                    </span>
                  </div>
                  <span className="text-slate-500 text-[11px] font-mono">ID: {s.id}</span>
                </div>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Status</span>
                    <span
                      className={`font-bold text-[11px] ${
                        s.connectionStatus === 'CONNECTED'
                          ? 'text-emerald-400'
                          : s.connectionStatus === 'DISCONNECTED'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      ● {s.connectionStatus}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Last Sync</span>
                    <span className="text-slate-300 font-mono">
                      {s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleTimeString() : 'Pending'}
                    </span>
                  </div>

                  {s.connectionStatus !== 'DISCONNECTED' && onDisconnectSource && (
                    <button
                      onClick={() => onDisconnectSource(s.id)}
                      className="rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 px-3 py-1 text-[11px] font-bold hover:bg-rose-900/60 transition-colors"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
