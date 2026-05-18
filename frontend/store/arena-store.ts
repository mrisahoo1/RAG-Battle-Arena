'use client';

import { create } from 'zustand';
import { comparePipelines, listDocuments, uploadDocument } from '@/services/api';
import { demoCompare, demoDocuments } from '@/lib/mock-data';
import type { ArenaSettings, CompareResponse, DocumentRecord, PipelineId } from '@/types/rag';

type ArenaState = {
  query: string;
  comparison: CompareResponse;
  documents: DocumentRecord[];
  settings: ArenaSettings;
  activePipeline: PipelineId | null;
  isRunning: boolean;
  uploadProgress: number;
  setQuery: (query: string) => void;
  setSettings: (settings: Partial<ArenaSettings>) => void;
  setActivePipeline: (pipeline: PipelineId | null) => void;
  runComparison: () => Promise<void>;
  hydrateDocuments: () => Promise<void>;
  ingestDocument: (file: File) => Promise<void>;
};

const defaultSettings: ArenaSettings = {
  chunkSize: 720,
  overlap: 96,
  embeddingModel: 'text-embedding-3-large',
  topK: 5,
  temperature: 0.2,
  retrievalMode: 'balanced',
  rerankerEnabled: true,
  metadataFilter: 'all documents'
};

export const useArenaStore = create<ArenaState>((set, get) => ({
  query: demoCompare.query,
  comparison: demoCompare,
  documents: demoDocuments,
  settings: defaultSettings,
  activePipeline: null,
  isRunning: false,
  uploadProgress: 100,
  setQuery: (query) => set({ query }),
  setSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  setActivePipeline: (pipeline) => set({ activePipeline: pipeline }),
  hydrateDocuments: async () => {
    const documents = await listDocuments();
    set({ documents });
  },
  runComparison: async () => {
    const { query, settings } = get();
    set({ isRunning: true });
    const comparison = await comparePipelines(query, settings);
    set({ comparison, isRunning: false });
  },
  ingestDocument: async (file) => {
    const { settings } = get();
    set({ uploadProgress: 8 });
    await new Promise((resolve) => setTimeout(resolve, 180));
    set({ uploadProgress: 32 });
    const document = await uploadDocument(file, settings);
    set((state) => ({ documents: [document, ...state.documents], uploadProgress: 100 }));
  }
}));
