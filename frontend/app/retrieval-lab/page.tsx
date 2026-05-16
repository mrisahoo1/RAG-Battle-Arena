import { RetrievalLab } from '@/components/retrieval-lab';
import { SectionHeader } from '@/components/section-header';

export default function RetrievalLabPage() {
  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Retrieval debugger" title="Inspect chunk movement from initial retrieval to final context." description="Explore similarity scores, BM25 contributions, reranker changes, and final context assembly for every pipeline." />
      <RetrievalLab />
    </div>
  );
}
