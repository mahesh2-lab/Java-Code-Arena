import React from 'react';
import { Handle, Position } from 'reactflow';

export const StackFrameNode = ({ data }: any) => {
    const locals = Object.entries(data.locals || {});

    return (
        <div className="px-4 py-3 rounded-md bg-[var(--graph-node-bg)] border border-[var(--graph-node-border)] min-w-[220px] shadow-lg transition-all duration-300 ring-1 ring-black/5 dark:ring-white/5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--graph-stack-accent)] shadow-[0_0_5px_rgba(245,158,11,0.3)]" />
                    <span className="text-[10px] font-bold text-[var(--graph-stack-accent)] tracking-wider uppercase">Stack</span>
                </div>
                <div className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                    {data.label}()
                </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-[var(--border-subtle)] w-full mb-3" />

            {/* Locals */}
            <div className="space-y-2">
                {locals.length > 0 ? (
                    locals.map(([name, value]: [string, any]) => {
                        const isRef = typeof value === 'string' && (value.startsWith('obj_') || value.startsWith('arr_'));
                        return (
                            <div key={name} className="flex justify-between items-center">
                                <span className="text-[11px] font-mono text-[var(--text-muted)] dark:text-zinc-500 uppercase tracking-tighter">{name}</span>

                                <div className="flex items-center gap-2">
                                    <div className={`text-[11px] font-mono font-bold px-2 py-1 rounded-sm text-center border transition-colors ${isRef
                                        ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-500"
                                        : "bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]"
                                        }`}>
                                        {String(value)}
                                    </div>

                                    {isRef && (
                                        <Handle
                                            type="source"
                                            position={Position.Right}
                                            id={name}
                                            className="!w-1.5 !h-1.5 !bg-[var(--graph-stack-accent)] !border-none !-right-1 shadow-[0_0_5px_rgba(245,158,11,0.4)]"
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-[10px] text-[var(--text-muted)] italic py-1 text-center">No locals</div>
                )}
            </div>
        </div>
    );
};
