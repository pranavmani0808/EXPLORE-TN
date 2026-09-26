import React from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Check, ArrowRight, ArrowLeft, Shield, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  isCompleted?: boolean;
}

export interface ExploreModuleWizardProps {
  moduleCategory: string;
  moduleTitle: string;
  moduleSubtitle: string;
  steps: WizardStep[];
  currentStepIndex: number;
  onSelectStep?: (index: number) => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onComplete?: () => void;
  isNextDisabled?: boolean;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export function ExploreModuleWizard({
  moduleCategory = "EXPLORER REGISTRATION",
  moduleTitle = "Create Your Explorer Profile",
  moduleSubtitle = "Use the progress menu on the left to track your trail setup progress",
  steps,
  currentStepIndex,
  onSelectStep,
  onNextStep,
  onPrevStep,
  onComplete,
  isNextDisabled = false,
  backHref = "/",
  backLabel = "Back to home",
  children,
}: ExploreModuleWizardProps) {
  const currentStep = steps[currentStepIndex] || steps[0];
  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* 1. TOP HEADER BAR */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-white hover:opacity-90">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500 text-zinc-950 shadow-md">
              <Compass className="size-5" />
            </div>
            <span>Explore<span className="text-amber-400">TN</span></span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              to={backHref}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>{backLabel}</span>
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-1.5 text-zinc-400 hover:text-red-400 transition-colors border-l border-zinc-800 pl-4"
            >
              <LogOut className="size-3.5" />
              <span>Exit Wizard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO CONTEXT BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-zinc-950 pt-10 pb-8 text-center border-b border-zinc-800/50">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(180deg,white,transparent)] pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 space-y-3">
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-300 uppercase tracking-widest text-[11px] font-extrabold px-3.5 py-1 backdrop-blur-md"
          >
            <Sparkles className="mr-1.5 size-3.5 text-amber-400 inline" />
            {moduleCategory}
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-display">
            {moduleTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            {moduleSubtitle}
          </p>
        </div>
      </div>

      {/* 3. SPLIT CONTAINER (LEFT STEPPER SIDEBAR + RIGHT WORKSPACE CARD) */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR: STEP PROGRESS MODULE */}
          <aside className="lg:col-span-4 sticky top-20 space-y-4">
            <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Progress Header */}
              <div className="space-y-2 pb-5 border-b border-zinc-800">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-zinc-400">
                  Application Progress
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {moduleCategory}
                </h2>
                
                <div className="pt-2 flex items-center justify-between text-xs font-medium">
                  <span className="text-zinc-300">Step {currentStepIndex + 1} of {steps.length}</span>
                  <span className="text-amber-400 font-bold font-mono">{progressPercent}% complete</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden mt-1.5 p-0.5 border border-zinc-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Step Menu List */}
              <div className="pt-4 space-y-2">
                {steps.map((step, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isCompleted = step.isCompleted || idx < currentStepIndex;

                  return (
                    <button
                      key={step.id}
                      onClick={() => onSelectStep?.(idx)}
                      disabled={!isCompleted && idx > currentStepIndex}
                      className={cn(
                        "w-full text-left flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-200 border",
                        isActive
                          ? "bg-amber-500/10 border-amber-500/40 text-white shadow-[0_0_20px_rgba(251,191,36,0.1)]"
                          : isCompleted
                          ? "bg-zinc-950/40 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/40"
                          : "bg-transparent border-transparent text-zinc-500 opacity-60 cursor-not-allowed"
                      )}
                    >
                      {/* Circle Number Badge */}
                      <div
                        className={cn(
                          "size-7 shrink-0 rounded-full flex items-center justify-center font-extrabold text-xs transition-colors mt-0.5",
                          isActive
                            ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20"
                            : isCompleted
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-zinc-800 text-zinc-400"
                        )}
                      >
                        {isCompleted && !isActive ? (
                          <Check className="size-4 stroke-[3]" />
                        ) : (
                          step.number
                        )}
                      </div>

                      {/* Step Labels */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={cn("text-xs font-bold truncate", isActive ? "text-amber-300" : "text-zinc-200")}>
                            {step.title}
                          </p>
                          {isCompleted && !isActive && (
                            <Check className="size-3.5 text-emerald-400 shrink-0 ml-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {step.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Trust Badge */}
              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center gap-2 text-[11px] text-zinc-400">
                <Shield className="size-4 text-emerald-400 shrink-0" />
                <span>Your data is encrypted end-to-end</span>
              </div>
            </div>
          </aside>

          {/* RIGHT WORKSPACE CARD */}
          <section className="lg:col-span-8">
            <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              
              {/* Step Header Block */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-800">
                <div className="size-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-base shadow-lg shadow-amber-500/10">
                  {currentStep.number}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display">
                    {currentStep.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    {currentStep.subtitle}
                  </p>
                </div>
              </div>

              {/* Active Step Content */}
              <div className="min-h-[340px]">
                {children}
              </div>

              {/* Navigation Action Footer */}
              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevStep}
                  disabled={currentStepIndex === 0}
                  className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl text-xs px-5"
                >
                  <ArrowLeft className="mr-1.5 size-4" />
                  Previous
                </Button>

                {isLastStep ? (
                  <Button
                    type="button"
                    onClick={onComplete}
                    disabled={isNextDisabled}
                    className="bg-gradient-to-r from-amber-400 to-emerald-500 text-zinc-950 font-bold hover:brightness-110 rounded-xl text-xs px-6 shadow-lg shadow-amber-500/20"
                  >
                    <span>Complete Registration</span>
                    <Sparkles className="ml-2 size-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={onNextStep}
                    disabled={isNextDisabled}
                    className="bg-amber-400 text-zinc-950 font-bold hover:bg-amber-300 rounded-xl text-xs px-6 shadow-lg shadow-amber-500/20"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                )}
              </div>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
