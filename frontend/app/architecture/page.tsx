import { ArchitectureDiagram } from '@/components/architecture-diagram';
import { SectionHeader } from '@/components/section-header';

export default function ArchitecturePage() {
  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="System architecture" title="Animated architecture diagrams for ingestion, retrieval, reranking, and agentic planning." description="The platform separates product UI, API contracts, retrieval engines, evaluation, and observability so each production concern is visible." />
      <ArchitectureDiagram />
    </div>
  );
}
