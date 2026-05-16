import { EvaluationDashboard } from '@/components/evaluation-dashboard';
import { SectionHeader } from '@/components/section-header';

export default function EvaluationPage() {
  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="AI evaluation" title="Judge answers across relevance, faithfulness, groundedness, precision, and risk." description="Blend heuristic scoring with LLM-as-judge style metrics to compare output quality across retrieval architectures." />
      <EvaluationDashboard />
    </div>
  );
}
