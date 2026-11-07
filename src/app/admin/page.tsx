"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Ban,
  Clock,
  History,
  Lock,
  UserX,
} from "lucide-react";

interface ReportItem {
  id: string;
  reason: string;
  details?: string;
  status: string;
  createdAt: string;
  reporter?: { email: string; name: string };
  generation?: {
    id: string;
    prompt: string;
    assets: Array<{ url: string; mimeType: string }>;
    user?: { id: string; email: string; isBanned: boolean };
  };
}

interface AuditItem {
  id: string;
  action: string;
  metadata?: string;
  createdAt: string;
  user?: { email: string; role: string };
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      if (!res.ok) {
        if (res.status === 403) {
          setErrorMsg("Access denied: You must be signed in as an Admin or Moderator.");
        } else {
          setErrorMsg("Failed to load moderation queue.");
        }
        return;
      }
      const data = await res.json();
      setReports(data.reports || []);
      setAuditLogs(data.recentAuditLogs || []);
    } catch {
      setErrorMsg("Failed to connect to moderation service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (reportId: string, action: "DISMISS" | "TAKEDOWN_CONTENT" | "BAN_USER") => {
    const reason = prompt("Enter moderation reason / justification:", `Actioned by moderator: ${action}`);
    if (!reason) return;

    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action, reason }),
      });

      if (res.ok) {
        setToastMsg(`Moderation action "${action}" applied.`);
        fetchQueue();
      }
    } catch {
      alert("Failed to execute moderation action");
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-zinc-400">Loading moderation dashboard...</div>;
  }

  if (errorMsg) {
    return (
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Restricted Access</h2>
        <p className="text-xs text-zinc-400">{errorMsg}</p>
        <p className="text-xs text-zinc-400">
          To test the admin console, sign in as <strong className="text-white">admin@nudy.local</strong> (Password: <strong className="text-white">AdminPassword18+!</strong>).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-pink-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-pink-500" /> Compliance & Moderation Queue
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Review user reports, enforce content takedowns, execute permanent bans, and audit system activities.
        </p>
      </div>

      {/* Reports Review Queue */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" /> Content Violation Reports ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121215] border border-zinc-800 text-center text-xs text-zinc-400">
            ✓ Moderation queue is clean. No pending user reports.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start justify-between"
              >
                <div className="flex gap-4 items-start">
                  {r.generation?.assets?.[0]?.url && (
                    <div className="w-24 h-24 rounded-xl bg-black border border-zinc-800 shrink-0 overflow-hidden">
                      <img
                        src={r.generation.assets[0].url}
                        alt="Flagged media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {r.reason}
                      </span>
                      <span className="text-zinc-400">
                        Reported by: {r.reporter?.email || "Anonymous"} &bull;{" "}
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {r.generation && (
                      <p className="text-zinc-300 italic max-w-xl">
                        Prompt: &quot;{r.generation.prompt}&quot;
                      </p>
                    )}

                    {r.generation?.user && (
                      <p className="text-zinc-400">
                        Creator: <span className="text-pink-400">{r.generation.user.email}</span>{" "}
                        {r.generation.user.isBanned && (
                          <span className="text-red-400 font-bold ml-1">(ALREADY BANNED)</span>
                        )}
                      </p>
                    )}

                    <div className="text-[11px] text-zinc-400">
                      Status: <strong className="text-zinc-300">{r.status}</strong>
                    </div>
                  </div>
                </div>

                {/* Moderation Actions */}
                {r.status === "PENDING" && (
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(r.id, "DISMISS")}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleAction(r.id, "TAKEDOWN_CONTENT")}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-medium transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Takedown
                    </button>
                    <button
                      onClick={() => handleAction(r.id, "BAN_USER")}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-red-600/30"
                    >
                      <Ban className="w-3.5 h-3.5" /> Ban User
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-Time Audit Log Table */}
      <div className="space-y-4 pt-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-pink-500" /> Compliance Audit Trail
        </h2>

        <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 text-zinc-400 uppercase font-semibold text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/30">
                    <td className="p-3.5 text-zinc-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-mono text-pink-400 font-semibold">{log.action}</td>
                    <td className="p-3.5 text-zinc-300">{log.user?.email || "SYSTEM"}</td>
                    <td className="p-3.5 text-zinc-400 truncate max-w-xs">{log.metadata || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

