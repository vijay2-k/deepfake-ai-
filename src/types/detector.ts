/**
 * Types for AI Image Authenticity Detector
 */

export type DetectionVerdict = 'Likely AI Generated' | 'Likely Real Photograph' | 'Inconclusive';

export type ArtifactSeverity = 'low' | 'medium' | 'high';

export interface VisualArtifact {
  area: string;
  finding: string;
  severity: ArtifactSeverity;
  type: 'diffusion' | 'gan' | 'lighting' | 'anatomy' | 'frequency' | 'texture' | 'compression';
  coordinates?: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number;
    height: number;
  };
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
  frequency_analysis_notes?: string;
}

export interface DetectionResult {
  id: string;
  user_id: string;
  image_name: string;
  image_url: string; // Base64 or URL
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
  scansToday: number;
  scanLimit: number;
}

export interface PlatformStats {
  totalScans: number;
  aiDetectedCount: number;
  realDetectedCount: number;
  inconclusiveCount: number;
  averageConfidence: number;
  averageLatencyMs: number;
  recentScans: DetectionResult[];
}
