import React from "react";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TimelineProps {
    currentStep: number;
    totalSteps: number;
    onStepChange: (step: number) => void;
    description?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
    currentStep,
    totalSteps,
    onStepChange,
    description,
}) => {
    if (totalSteps === 0) return null;

    const progress = (currentStep / (totalSteps - 1 || 1)) * 100;

    return (
        <div className="flex flex-col bg-[var(--bg-panel-header)] border-t border-[var(--border-subtle)] px-6 py-2 select-none transition-colors duration-300">
            {/* Upper Rail: Progress Indicator */}
            <div className="relative w-full mb-3 group">
                <div className="h-0.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--graph-stack-accent)] transition-all duration-300 ease-out shadow-[0_0_6px_rgba(245,158,11,0.2)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Step Markers (Subtle Dots) */}
                {totalSteps < 50 && (
                    <div className="absolute top-0 left-0 w-full h-0.5 flex justify-between pointer-events-none">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-0.5 h-0.5 rounded-full transition-colors duration-300 ${i <= currentStep ? "bg-[var(--graph-stack-accent)]/20" : "bg-[var(--text-muted)]/20"
                                    }`}
                            />
                        ))}
                    </div>
                )}

                <input
                    type="range"
                    min={0}
                    max={totalSteps - 1}
                    value={currentStep}
                    onChange={(e) => onStepChange(parseInt(e.target.value))}
                    className="absolute -top-2 left-0 w-full h-4 opacity-0 cursor-pointer z-20"
                />
            </div>

            {/* Content & Controls Row */}
            <div className="flex items-center gap-4 justify-between">
                {/* Navigation Group */}
                <div className="flex items-center gap-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStepChange(0)}
                        disabled={currentStep === 0}
                        className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--graph-stack-accent)] hover:bg-[var(--graph-stack-accent)]/10 disabled:opacity-30 rounded-md transition-all"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStepChange(currentStep - 1)}
                        disabled={currentStep === 0}
                        className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--graph-stack-accent)] hover:bg-[var(--graph-stack-accent)]/10 disabled:opacity-30 rounded-md transition-all"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    <div className="flex items-center px-3 min-w-[80px] border-x border-[var(--border-subtle)] mx-0.5">
                        <div className="text-[12px] font-mono font-bold text-[var(--text-primary)] flex items-baseline gap-1">
                            <span className="text-[9px] font-bold text-[var(--graph-stack-accent)] uppercase mr-1">STEP</span>
                            {currentStep + 1}
                            <span className="text-[10px] text-[var(--text-muted)] font-medium">/</span>
                            <span className="text-[10px] text-[var(--text-muted)] font-medium">{totalSteps}</span>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStepChange(currentStep + 1)}
                        disabled={currentStep === totalSteps - 1}
                        className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--graph-stack-accent)] hover:bg-[var(--graph-stack-accent)]/10 disabled:opacity-30 rounded-md transition-all"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onStepChange(totalSteps - 1)}
                        disabled={currentStep === totalSteps - 1}
                        className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--graph-stack-accent)] hover:bg-[var(--graph-stack-accent)]/10 disabled:opacity-30 rounded-md transition-all"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Description Space */}
                <div className="flex-1 flex items-center gap-3 px-3 py-1.5 bg-[var(--bg-surface)]/50 rounded-lg border border-[var(--border-subtle)] max-w-2xl">
                    <Info className="h-3 w-3 text-[var(--graph-stack-accent)] shrink-0" />
                    <p className="text-[11px] font-medium text-[var(--text-secondary)] leading-tight line-clamp-1 italic">
                        {description || "Initializing program state..."}
                    </p>
                </div>
            </div>
        </div>
    );
};
