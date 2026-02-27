import { useState, useEffect, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/Editor";
import { Console } from "@/components/Console";
import { Play, RotateCcw, Save, Share2, Code2, Eye, Terminal as TerminalIcon, GitGraph } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateSnippet } from "@/hooks/use-snippets";
import { Theme, LogEntry } from "@/types";
import { MemoryGraph } from "@/components/Graph/MemoryGraph";
import { Timeline } from "@/components/Timeline/Timeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const DEFAULT_CODE = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Try some math
        int a = 5;
        int b = 10;
        System.out.println("Sum: " + (a + b));
    }
}`;

export default function Playground() {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [output, setOutput] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [theme] = useState<Theme>("dark");
  const [stdinInput, setStdinInput] = useState<string>("");
  const [errorReview, setErrorReview] = useState<any>(null);
  const [aiReview, setAiReview] = useState<string | null>(null);

  // Visualization State
  const [activeTab, setActiveTab] = useState<string>("console");
  const [visualizeSteps, setVisualizeSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisualizing, setIsVisualizing] = useState(false);

  const { toast } = useToast();
  const createSnippet = useCreateSnippet();

  // Load saved code
  useEffect(() => {
    const saved = localStorage.getItem("java-code");
    if (saved) setCode(saved);
  }, []);

  // Save code on change
  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      localStorage.setItem("java-code", value);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput([]);
    setIsError(false);
    setExecutionTime(null);
    setErrorReview(null);
    setAiReview(null);
    const startTime = performance.now();

    try {
      // Send code to backend for compilation and execution
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));

      if (result.success) {
        const lines = result.output
          .split("\n")
          .filter((line: string) => line.trim())
          .map(
            (line: string): LogEntry => ({
              text: line,
              type: "success",
              timestamp: Date.now(),
            }),
          );
        setOutput(lines);
      } else {
        setIsError(true);
        const errorLines = result.error
          .split("\n")
          .filter((line: string) => line.trim())
          .map(
            (line: string): LogEntry => ({
              text: line,
              type: "error",
              timestamp: Date.now(),
            }),
          );
        setOutput(errorLines);

        // Capture error reviews if present
        if (result.error_review) {
          setErrorReview(result.error_review);
        }
        if (result.ai_review) {
          setAiReview(result.ai_review);
        }
      }
    } catch (err: any) {
      setIsError(true);
      setOutput([
        {
          text: `System Error: ${err.message}`,
          type: "error",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleVisualize = async () => {
    setIsVisualizing(true);
    setActiveTab("graph");
    setVisualizeSteps([]);
    setCurrentStep(0);

    try {
      const response = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) throw new Error("Failed to fetch visualization data");

      const result = await response.json();
      if (result.success) {
        setVisualizeSteps(result.steps);
        toast({
          title: "Visualization Ready",
          description: `Generated ${result.steps.length} execution steps.`,
        });
      } else {
        toast({
          title: "Visualization Error",
          description: result.error || "Failed to parse Java code.",
          variant: "destructive",
        });
        setActiveTab("console");
      }
    } catch (err: any) {
      toast({
        title: "System Error",
        description: err.message,
        variant: "destructive",
      });
      setActiveTab("console");
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset code to default? You will lose current changes.")) {
      setCode(DEFAULT_CODE);
      localStorage.setItem("java-code", DEFAULT_CODE);
      setOutput([]);
      setExecutionTime(null);
    }
  };

  const handleSaveSnippet = () => {
    createSnippet.mutate(
      { code, language: "java" },
      {
        onSuccess: () => {
          toast({
            title: "Saved!",
            description: "Your snippet has been saved to the database.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to save snippet.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Navbar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Code2 className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-100">
            Java Playground
          </h1>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-400"></span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleReset}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>

          <Button
            onClick={handleSaveSnippet}
            disabled={createSnippet.isPending}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <Save className="mr-2 h-4 w-4" />
            {createSnippet.isPending ? "Saving..." : "Save"}
          </Button>

          <div className="mx-2 h-6 w-px bg-slate-800" />

          <Button
            onClick={handleVisualize}
            disabled={isVisualizing || isRunning}
            variant="outline"
            size="sm"
            className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 h-7 text-[11px] px-3 font-semibold"
          >
            {isVisualizing ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                Analyzing
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visualize
              </span>
            )}
          </Button>

          <Button
            onClick={runCode}
            disabled={isRunning || isVisualizing}
            className="glow-primary min-w-[120px] bg-primary font-semibold text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Running
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="h-4 w-4 fill-current" />
                Run Code
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full rounded-xl border border-slate-800/50 bg-slate-900/20"
        >
          {/* Editor Panel */}
          <ResizablePanel defaultSize={60} minSize={30} className="relative">
            <Editor code={code} onChange={handleCodeChange} theme={theme} />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="bg-slate-800 hover:bg-primary/50 transition-colors w-1.5"
          />

          {/* Output Panel */}
          <ResizablePanel defaultSize={40} minSize={20}>
            <div className="flex flex-col h-full bg-slate-950/50">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/80">
                  <TabsList className="bg-slate-900 border-slate-800">
                    <TabsTrigger
                      value="console"
                      className="data-[state=active]:bg-slate-800 data-[state=active]:text-primary gap-2"
                    >
                      <TerminalIcon className="h-3.5 w-3.5" />
                      Console
                    </TabsTrigger>
                    <TabsTrigger
                      value="graph"
                      className="data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-400 gap-2"
                    >
                      <GitGraph className="h-3.5 w-3.5" />
                      Memory Graph
                    </TabsTrigger>
                  </TabsList>

                  {activeTab === 'graph' && visualizeSteps.length > 0 && (
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
                      Live Simulation
                    </div>
                  )}
                </div>

                <div className="flex-1 relative overflow-hidden">
                  <TabsContent value="console" className="absolute inset-0 m-0 border-none p-0 flex flex-col h-full">
                    <Console
                      output={visualizeSteps.length > 0 && activeTab === 'graph'
                        ? (visualizeSteps[currentStep]?.console || "").split('\n').filter(Boolean).map((t: string) => ({ text: t, type: 'info', timestamp: Date.now() }))
                        : output
                      }
                      executionTime={executionTime}
                      onClear={() => {
                        setOutput([]);
                        setErrorReview(null);
                        setAiReview(null);
                        setVisualizeSteps([]);
                      }}
                      theme={theme}
                      stdinInput={stdinInput}
                      onStdinChange={setStdinInput}
                      errorReview={errorReview}
                      aiReview={aiReview}
                      hideHeader
                    />
                  </TabsContent>

                  <TabsContent value="graph" className="absolute inset-0 m-0 border-none p-0 flex flex-col h-full">
                    {visualizeSteps.length > 0 ? (
                      <div className="flex flex-col h-full">
                        <div className="flex-1 relative">
                          <MemoryGraph
                            nodes={visualizeSteps[currentStep]?.graph.nodes || []}
                            edges={visualizeSteps[currentStep]?.graph.edges || []}
                          />
                        </div>
                        <Timeline
                          currentStep={currentStep}
                          totalSteps={visualizeSteps.length}
                          onStepChange={setCurrentStep}
                          description={visualizeSteps[currentStep]?.description}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                        <GitGraph className="h-12 w-12 opacity-20" />
                        <div className="text-center space-y-1">
                          <p className="text-sm font-medium">No visualization active</p>
                          <p className="text-xs opacity-60">Click "Visualize" above to see the memory graph</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* Footer */}
      <footer className="flex h-8 shrink-0 items-center justify-between border-t border-slate-800 bg-slate-950 px-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>Client-side Java via WebAssembly</span>
          <span>Open JDK 8 environment</span>
        </div>
      </footer>
    </div>
  );
}
