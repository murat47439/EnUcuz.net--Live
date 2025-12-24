"use client";

import { useEffect, useState } from "react";
import { GetLogs } from "@/lib/api/admin/useGetLogs";

export default function LogsTerminal() {
    const [logs, setLogs] = useState("Loading logs...");

    useEffect(() => {
        GetLogs()
            .then(setLogs)
            .catch((err) => setLogs(err.message));
    }, []);

    return (
        <div className="rounded-xl border border-zinc-800 bg-[#0d1117] overflow-hidden">

            {/* Header */}
            <div className="px-4 py-2 border-b border-zinc-800 bg-[#161b22]">
                <span className="font-mono text-sm text-blue-400">
                    Application Logs
                </span>
            </div>

            {/* Terminal */}
            <pre
                className="
          h-[70vh]
          overflow-y-auto
          px-4
          py-4
          text-[13px]
          leading-relaxed
          font-mono
          text-zinc-200
          bg-[#0d1117]
          whitespace-pre-wrap
          scrollbar-thin
          scrollbar-thumb-zinc-700
          scrollbar-track-transparent
        "
            >
                {logs}
            </pre>
        </div>
    );
}
