"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Sparkles,
  Layers,
  HelpCircle,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { EvalCase } from "@/lib/db/schema";
import {
  createEvalCaseAction,
  deleteEvalCaseAction,
  generateSeedCasesAction,
} from "@/app/actions/evaluations";

interface EvalCasesTableProps {
  workspaceId: string;
  cases: EvalCase[];
  onRefresh: () => void;
}

export function EvalCasesTable({
  workspaceId,
  cases,
  onRefresh,
}: EvalCasesTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [question, setQuestion] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [category, setCategory] = useState("general");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !expectedAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createEvalCaseAction(workspaceId, {
        question: question.trim(),
        expectedAnswer: expectedAnswer.trim(),
        category: category.trim() || "general",
        difficulty,
      });
      if (res.success) {
        setQuestion("");
        setExpectedAnswer("");
        setIsAdding(false);
        onRefresh();
      } else {
        alert(res.error || "Failed to create case");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (caseId: string) => {
    if (!confirm("Are you sure you want to delete this evaluation case?")) return;
    setDeletingId(caseId);
    try {
      const res = await deleteEvalCaseAction(workspaceId, caseId);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.error || "Failed to delete case");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateSeedCases = async () => {
    setIsGenerating(true);
    try {
      const res = await generateSeedCasesAction(workspaceId, 3);
      if (res.success) {
        onRefresh();
      } else {
        alert(res.error || "Could not auto-generate cases");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const difficultyColors = {
    easy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    hard: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Evaluation Benchmark Cases</CardTitle>
          </div>
          <CardDescription>
            Golden question-answer pairs used to evaluate retrieval quality and answer accuracy.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSeedCases}
            disabled={isGenerating}
            className="text-xs"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
            )}
            Auto-Generate Seed Cases
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Test Case
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Inline Create Form */}
        {isAdding && (
          <form
            onSubmit={handleCreate}
            className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3"
          >
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Create New Test Case
            </h4>
            <div className="space-y-2">
              <Input
                placeholder="Question (e.g. What is the reimbursement limit for office equipment?)"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
                className="bg-card text-sm"
              />
              <textarea
                placeholder="Expected Ground Truth Answer (e.g. The reimbursement limit is $500 per calendar year.)"
                value={expectedAnswer}
                onChange={(e) => setExpectedAnswer(e.target.value)}
                required
                rows={3}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Category (e.g. policy, bylaws, general)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-44 bg-card text-xs h-8"
              />

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="rounded-md border border-input bg-card px-2 text-xs h-8 text-foreground"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <div className="ml-auto flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="text-xs h-8"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : null}
                  Save Case
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Cases List */}
        {cases.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-border rounded-xl">
            <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium text-foreground">No benchmark test cases yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Create manual test cases or click &quot;Auto-Generate Seed Cases&quot; to synthesize golden questions from your workspace documents.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSeedCases}
              disabled={isGenerating}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Synthesize From Documents
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {cases.map((c) => {
              const isExpanded = expandedId === c.id;
              const isDeleting = deletingId === c.id;

              return (
                <div
                  key={c.id}
                  className="p-3.5 hover:bg-muted/40 transition-colors space-y-2 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{c.question}</span>
                        <Badge
                          variant="outline"
                          className="capitalize text-[11px] py-0 px-2"
                        >
                          {c.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`capitalize text-[11px] py-0 px-2 ${
                            difficultyColors[c.difficulty as keyof typeof difficultyColors] || ""
                          }`}
                        >
                          {c.difficulty}
                        </Badge>
                        {c.expectedChunkIds && c.expectedChunkIds.length > 0 && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {c.expectedChunkIds.length} target {c.expectedChunkIds.length === 1 ? "chunk" : "chunks"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className="h-7 w-7 text-muted-foreground"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(c.id)}
                        disabled={isDeleting}
                        className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded expected answer view */}
                  {isExpanded && (
                    <div className="p-3 rounded-md bg-muted/60 text-xs space-y-1 mt-2 border border-border/50">
                      <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                        Expected Ground Truth:
                      </span>
                      <p className="text-foreground leading-relaxed">
                        {c.expectedAnswer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
