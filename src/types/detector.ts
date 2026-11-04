/**
 * Types for KRYPTX Multimodal AI Media Forensics Platform
 */

export type MediaType = 'image' | 'video' | 'audio';

export type DetectionVerdict =
  | 'Likely AI Generated'
  | 'Likely AI-Generated'
  | 'Likely Real Photograph'
  | 'Likely AI Modified Photograph'
  | 'Likely Authentic'
  | 'Likely Deepfake'
  | 'Possibly AI-Manipulated'
  | 'Mixed / Partially Manipulated'
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

export interface ImageQualityInfo {
  width: number;
  height: number;
  megapixels: number;
  aspectRatio: string;
  isPartialOrCrop: boolean;
  cropRiskFactor: 'low' | 'moderate' | 'high';
  blurIndex: number;
  isBlurry: boolean;
  estimatedQualityFactor: number;
  noiseVariance: number;
  hasUniformSmoothing: boolean;
  sufficiency: 'sufficient' | 'marginal' | 'insufficient';
  reason?: string;
}

export interface PatchGridItem {
  patchIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  gradientEnergy: number;
  noiseResidual: number;
  microSmoothness: number;
  syntheticScore: number;
  anomalyType?: string;
  isSuspicious: boolean;
}

export interface PatchAnalysisInfo {
  patchesExtracted: number;
  suspiciousPatchesCount: number;
  patchAggregationScore: number;
  patchGrid: PatchGridItem[];
}

export interface PerceivedVoiceAgeInfo {
  estimatedAgeRange: string; // e.g. "Adult (30–44)" or "AGE ESTIMATION UNAVAILABLE"
  confidenceRating: 'High' | 'Moderate' | 'Low' | 'Unavailable';
  vocalResonanceCategory: string;
  estimatedF0Hz: number;
  uncertaintyDisclaimer: string;
  isAvailable: boolean;
}

export interface VoiceCharacteristicsInfo {
  speakingPitchHz: number;
  pitchStdDevHz: number;
  pitchDynamicsSummary: string;
  speechRhythm: string;
  pauseCadence: string;
  voiceClarity: string;
}

export interface VoiceForensicsInfo {
  totalDurationSec: number;
  usableSpeechSec: number;
  silenceOrNoiseSec: number;
  speechRatioPct: number;
  snrDb: number;
  isDurationSufficient: boolean;
  sufficiencyReason?: string;
  spectralCentroidHz: number;
  spectralRolloffHz: number;
  zeroCrossingRate: number;
  pitchF0Variance: number;
  vocoderPhaseMetallicScore: number;
  formantContinuityScore: number;
  voiceCharacteristics?: VoiceCharacteristicsInfo;
  perceivedAgeEstimate?: PerceivedVoiceAgeInfo;
  detectorEngine?: string;
  detectorVersion?: string;
  segments: {
    segmentIndex: number;
    startTime: string;
    endTime: string;
    durationSec: number;
    isUsableSpeech: boolean;
    syntheticScore: number;
    vocoderArtifactsFound: boolean;
    finding: string;
  }[];
}

export interface RegionalForensicFinding {
  regionType: 'face' | 'clothing' | 'background' | 'enhancement' | 'general';
  label: string;
  manipulationLikelihood: number; // 0-100
  status: 'high_evidence' | 'moderate_evidence' | 'authentic_unmodified' | 'insufficient_evidence';
  coordinates?: { x: number; y: number; width: number; height: number }; // percentage 0-100
  evidencePoints: string[];
  textureDiscrepancy: number;
  noiseInconsistency: number;
}

export interface RegionalAnalysisDetails {
  faceAssessment: {
    status: 'manipulated' | 'authentic' | 'inconclusive' | 'no_face_detected';
    score: number;
    findings: string;
    coordinates?: { x: number; y: number; width: number; height: number };
  };
  clothingAssessment: {
    status: 'manipulated' | 'authentic' | 'inconclusive' | 'no_clothing_detected';
    score: number;
    findings: string;
    coordinates?: { x: number; y: number; width: number; height: number };
  };
  backgroundAssessment: {
    status: 'manipulated' | 'authentic' | 'inconclusive';
    score: number;
    findings: string;
    coordinates?: { x: number; y: number; width: number; height: number };
  };
  enhancementAssessment: {
    isGenerativeUpscaled: boolean;
    isAiSharpened: boolean;
    isSkinRetouched: boolean;
    findings: string;
  };
  regions: RegionalForensicFinding[];
  manipulationHeatmapUrl?: string;
}

export interface GenerationSourceItem {
  engine: string; // e.g. "gptimage2", "midjourney", "dall_e", "stable_diffusion", "flux", "sora", "kling", etc.
  probability: number; // 0-100 (e.g. 99.8)
  category: 'image' | 'video' | 'multimodal';
  isConclusive?: boolean;
  provider?: string;
  notes?: string;
}

export interface FaceDeepfakeDetection {
  faceId: number;
  coordinates: { x: number; y: number; width: number; height: number }; // percentage 0-100
  deepfakeScore: number; // 0-100
  isDeepfake: boolean;
  faceQuality: number; // 0-100
  landmarks?: string;
  findings: string;
}

export interface DeepfakeAnalysisInfo {
  facesDetectedCount: number;
  overallDeepfakeScore: number; // 0-100
  verdict: 'Likely Authentic' | 'Likely Deepfake' | 'No Detectable Face' | 'Inconclusive';
  faces: FaceDeepfakeDetection[];
  faceSwapDetected: boolean;
  syntheticIdentityDetected: boolean;
  confidenceRating?: 'High' | 'Moderate' | 'Low';
}

export interface C2PAMetadataInfo {
  hasC2PA: boolean;
  issuer?: string;
  manifestTitle?: string;
  claimGenerator?: string;
  signatureValid?: boolean;
  validationStatus: 'verified' | 'unverified' | 'tampered' | 'not_present';
  details?: string;
}

export interface DetectionProviderInfo {
  provider: 'hive' | 'local_kryptx' | 'gemini_vision' | 'hybrid';
  displayName: string;
  status: 'live_external' | 'local_active' | 'fallback_active';
  latencyMs: number;
  externalId?: string;
  apiVersion?: string;
}

export interface AnalysisDetails {
  ai_probability: number;
  human_probability: number;
  ai_generated_score?: number; // Hive-style overall AI-Generated % (e.g. 99.7%)
  deepfake_score?: number; // Hive-style overall Deepfake % (e.g. 0.0%)
  generation_sources?: GenerationSourceItem[]; // Top generation models breakdown
  deepfake_analysis?: DeepfakeAnalysisInfo; // Face-level deepfake details
  c2pa_metadata?: C2PAMetadataInfo; // C2PA credentials
  provider_info?: DetectionProviderInfo; // Provider adapter information
  whole_image_ai_likelihood?: number;
  local_manipulation_likelihood?: number;
  authentic_camera_evidence?: number;
  confidence_level?: 'High' | 'Moderate' | 'Low';
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
  stage_timings?: Record<string, number>;
  job_id?: string;
  // Media-specific dedicated forensic engines
  image_quality?: ImageQualityInfo;
  patch_analysis?: PatchAnalysisInfo;
  regional_analysis?: RegionalAnalysisDetails;
  voice_forensics?: VoiceForensicsInfo;
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
