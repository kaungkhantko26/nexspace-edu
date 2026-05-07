export type UploadedFile = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "pptx" | "txt";
  status: "processing" | "indexed" | "failed";
  summary: string;
};

export type AnalyticsMetric = {
  label: string;
  value: string;
  delta: string;
};

export type AssignmentInsight = {
  label: string;
  score: number;
  status: "strong" | "watch" | "risk";
};

