/**
 * Types for KRYPTX Multimodal AI Media Forensics Platform
 */

export type MediaType = 'image' | 'video' | 'audio';

export type DetectionVerdict =
  | 'Likely AI Generated'
  | 'Likely Real Photograph'
  | 'Likely Synthetic Video / Deepfake'
  | 'Likely Authentic Video'
  | 'Likely AI Generated Voice / Clone'
  | 'Likely Authentic Voice'
  | 'Inconclusive';

export type ArtifactSeverity = 'low' | 'medium' | 'high';

export interface VisualArtifact {
  area: string;
  finding: string;
  severity: ArtifactSeverity;
  type:
    | 'diffusion'
    | 'gan'
    | 'lighting'
    | 'anatomy'
    | 'frequency'
    | 'texture'
    | 'compression'
    | 'temporal'
    | 'lip_sync'
    | 'audio_spectral';
  coordinates?: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number;
    height: number;
  };
  timestamp?: string; // e.g. "00:04" for video/audio
}

export interface ExifMetadata {
  hasExif: boolean;
  make?: string;
  model?: string;
  lensModel?: string;
  iso?: number | string;
  fNumber?: number | string;
  exposureTime?: string;
  focalLength?: string;
  software?: string;
  dateTime?: string;
  colorSpace?: string;
  imageWidth?: number;
  imageHeight?: number;
  rawTagsFound?: number;
  assessmentNote?: string;
  // Video & Audio metadata
  duration?: number; // in seconds
  resolution?: string;
  fps?: number;
  videoCodec?: string;
  audioCodec?: string;
  bitrate?: string | number;
  sampleRate?: number;
  channels?: number;
}

export interface VideoFrameAnalysis {
  frameIndex: number;
  timestamp: string;
  frameUrl?: string; // thumbnail base64 or URL
  findings: string;
  suspiciousScore: number; // 0-100
}

export interface AudioSegmentAnalysis {
  startTime: string;
  endTime: string;
  finding: string;
  syntheticLikelihood: number; // 0-100
}

export interface AnalysisDetails {
  ai_probability: number;
  human_probability: number;
  visual_artifacts: VisualArtifact[];
  lighting_and_shadow_assessment: string;
  texture_and_skin_assessment: string;
  anatomical_and_geometric_coherence: string;
  compression_and_pixel_anomalies: string;
  explainable_summary: string;
  supporting_reasons: string[];
  counter_factors_or_uncertainty: string[];
  detection_limitations: string;
  metadata: ExifMetadata;
  knowledge_version?: string;
  frequency_analysis_notes?: string;
  // Video specific
  frame_analyses?: VideoFrameAnalysis[];
  temporal_coherence_notes?: string;
  lip_sync_assessment?: string;
  // Audio specific
  audio_segments?: AudioSegmentAnalysis[];
  spectral_and_prosody_notes?: string;
  voice_cloning_assessment?: string;
}

export interface DetectionResult {
  id: string;
  user_id: string;
  media_type: MediaType;
  image_name: string; // File name
  image_url: string; // Base64 preview or URL
  media_url?: string; // Original media URL or base64
  detection_result: DetectionVerdict;
  confidence_score: number;
  model_name: string;
  analysis_details: AnalysisDetails;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  role?: 'ADMIN' | 'ANALYST' | 'USER';
  adminToken?: string;
  scansToday: number;
  imageScansToday: number;
  videoScansToday: number;
  audioScansToday: number;
  scanLimit: number;
  isUnlimited: boolean;
}

export type TrainingTarget = 'image' | 'video' | 'voice';

export interface TrainingReference {
  id: string;
  type: 'image' | 'video' | 'audio' | 'website';
  name: string;
  url?: string;
  storagePath?: string;
  previewUrl?: string;
  description: string;
  extractedObservations: string;
  source: string;
  dateAdded: string;
  accepted: boolean;
}

export interface TrainingPlan {
  section1Objective: string;
  section2Knowledge: string[];
  section3ReferenceMaterial: string[];
  section4DetectionGuidance: string[];
  section5ValidationPlan: string;
  section6Limitations: string;
  section7ProposedIntegration: string;
  section8Version: string;
  status: 'pending' | 'approved' | 'rejected';
  generatedAt: string;
}

export interface TrainingMessage {
  id: string;
  sender: 'admin' | 'ai';
  content: string;
  timestamp: string;
  references?: TrainingReference[];
  planProposal?: TrainingPlan;
}

export interface TrainingSession {
  id: string;
  targetAi: TrainingTarget;
  title: string;
  status: 'active' | 'plan_generated' | 'approved' | 'rejected';
  messages: TrainingMessage[];
  references: TrainingReference[];
  proposedPlan: TrainingPlan | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeRelease {
  id: string;
  version: string;
  targetAi: TrainingTarget;
  title: string;
  objective: string;
  knowledgeSummary: string[];
  detectionGuidance: string[];
  rules: string;
  referencesCount: number;
  approvedBy: string;
  approvedAt: string;
  isActive: boolean;
  planId: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  details: any;
  ip?: string;
}

export interface AdminOverview {
  imageVersion: string;
  videoVersion: string;
  voiceVersion: string;
  pendingPlansCount: number;
  approvedSessionsCount: number;
  lastTrainingUpdate: string;
  activeReleases: KnowledgeRelease[];
  allReleases: KnowledgeRelease[];
  totalSessionsCount?: number;
}

export interface PlatformStats {
  totalScans: number;
  imageScansCount: number;
  videoScansCount: number;
  audioScansCount: number;
  aiDetectedCount: number;
  realDetectedCount: number;
  inconclusiveCount: number;
  averageConfidence: number;
  averageLatencyMs: number;
  recentScans: DetectionResult[];
}
