import React from 'react';
import { Handle, Position } from 'reactflow';

export const HeapObjectNode = ({ data }: any) => {
    const fields = Object.entries(data.fields || {});

    return (
        <div className="px-4 py-3 rounded-md bg-[var(--graph-node-bg)] border border-[var(--graph-node-border)] min-w-[220px] shadow-lg transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--graph-heap-accent)] shadow-[0_0_5px_rgba(16,185,129,0.3)]" />
                    <span className="text-[10px] font-bold text-[var(--graph-heap-accent)] tracking-wider uppercase">Heap</span>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                    {data.type}
                </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-[var(--border-subtle)] w-full mb-3" />

            {/* Fields */}
            <div className="space-y-2">
                {fields.length > 0 ? (
                    fields.map(([name, value]: [string, any]) => (
                        <div key={name} className="flex justify-between items-center group">
                            <span className="text-[11px] font-mono text-[var(--text-muted)] dark:text-zinc-500 uppercase tracking-tighter">{name}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-[var(--graph-heap-accent)] bg-emerald-500/10 px-2 py-1 rounded-sm border border-emerald-500/20 dark:border-emerald-500/30 min-w-[60px] text-center uppercase">
                                    {String(value)}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-[10px] text-[var(--text-muted)] italic py-1 text-center">No fields</div>
                )}
            </div>

            <Handle
                type="target"
                position={Position.Left}
                className="!w-1.5 !h-1.5 !bg-[var(--graph-heap-accent)] !border-none !-left-1 shadow-[0_0_5px_rgba(16,185,129,0.4)]"
            />
        </div>
    );
};
