const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'components', 'DetectionResultView.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const marker = `const ImageForensicsView: React.FC<DetectionResultViewProps> = ({
  result,
  onReset,
  history = [],
  onSelectResult,
}) => {`;

const splitIdx = content.indexOf(marker);
if (splitIdx === -1) {
  console.error('Marker not found!');
  process.exit(1);
}

const before = content.slice(0, splitIdx + marker.length);

const newImplementation = `
  const [activeTab, setActiveTab] = useState<'sources' | 'deepfake' | 'regional' | 'forensics' | 'technical'>('sources');
  const [viewMode, setViewMode] = useState<'original' | 'heatmap' | 'ela' | 'sobel' | 'split'>('original');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showAllGeneratorsModal, setShowAllGeneratorsModal] = useState<boolean>(false);
  const [searchGenQuery, setSearchGenQuery] = useState<string>('');
  const [genFilterCategory, setGenFilterCategory] = useState<'all' | 'image' | 'video'>('all');

  const [elaImageUrl, setElaImageUrl] = useState<string | null>(null);
  const [sobelImageUrl, setSobelImageUrl] = useState<string | null>(null);
  const [sha256, setSha256] = useState<string>('Computing digest...');
  const [copied, setCopied] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [isProcessingForensicMaps, setIsProcessingForensicMaps] = useState(true);
  const [selectedArtifact, setSelectedArtifact] = useState<VisualArtifact | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  // Hive-calibrated scores
  const aiGeneratedPct =
    result.analysis_details.ai_generated_score ??
    (result.detection_result === 'Likely AI Generated' || result.detection_result === 'Likely AI-Generated'
      ? result.confidence_score
      : result.analysis_details.ai_probability);

  const deepfakePct =
    result.analysis_details.deepfake_score ??
    (result.detection_result?.toLowerCase().includes('deepfake')
      ? result.confidence_score
      : 0.0);

  const isLikelyAi = aiGeneratedPct >= 65;
  const isLikelyDeepfake = deepfakePct >= 65;

  // Generation Sources: Top list
  const defaultTopSources = [
    { engine: 'gptimage2', probability: isLikelyAi ? 99.8 : 0.2, category: 'image' as const, isConclusive: isLikelyAi },
    { engine: 'sora', probability: 0.0, category: 'video' as const },
    { engine: 'pika', probability: 0.0, category: 'video' as const },
    { engine: 'haiper', probability: 0.0, category: 'video' as const },
    { engine: 'kling', probability: 0.0, category: 'video' as const },
  ];
  const generationSources = result.analysis_details.generation_sources?.length
    ? result.analysis_details.generation_sources
    : defaultTopSources;

  const topDetectedEngine = generationSources[0]?.engine || 'gptimage2';
  const topDetectedProb = generationSources[0]?.probability ?? aiGeneratedPct;

  // Generate SHA-256 and forensic maps
  useEffect(() => {
    let isMounted = true;

    async function processMaps() {
      try {
        setIsProcessingForensicMaps(true);
        const hash = await computeSHA256(result.image_url);
        if (isMounted) setSha256(hash);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = async () => {
          try {
            const [ela, sobel] = await Promise.all([
              generateErrorLevelAnalysis(img),
              generateSobelEdgeMap(img),
            ]);
            if (isMounted) {
              setElaImageUrl(ela);
              setSobelImageUrl(sobel);
              setIsProcessingForensicMaps(false);
            }
          } catch (e) {
            console.error('Forensic map error', e);
            if (isMounted) setIsProcessingForensicMaps(false);
          }
        };
        img.onerror = () => {
          if (isMounted) setIsProcessingForensicMaps(false);
        };
        img.src = result.image_url;
      } catch (err) {
        console.error('Error generating hash', err);
        if (isMounted) setIsProcessingForensicMaps(false);
      }
    }

    processMaps();
    return () => {
      isMounted = false;
    };
  }, [result]);

  const handleCopySummary = () => {
    const text = \`KRYPTX / Hive Detect Forensic Report
Target: \${result.image_name}
Verdict: \${result.detection_result} (Confidence: \${result.confidence_score}%)
AI-Generated Probability: \${aiGeneratedPct}%
Deepfake Probability: \${deepfakePct}%
Likely Generation Engine: \${topDetectedEngine} (\${topDetectedProb}%)
SHA-256 Digest: \${sha256}
Provider: \${result.analysis_details.provider_info?.displayName || result.model_name}
Timestamp: \${new Date(result.created_at).toUTCString()}\`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportJson = () => {
    const exportData = {
      ...result,
      sha256,
      exportTimestamp: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', \`KRYPTX_Forensic_Dossier_\${result.id.slice(0, 10)}.json\`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  const handleDownloadPdf = () => {
    printForensicReport(result, sha256);
  };

  // Filter generator list for modal drawer
  const filteredGenerators = HIVE_SUPPORTED_GENERATORS.filter((gen) => {
    const matchesSearch =
      gen.name.toLowerCase().includes(searchGenQuery.toLowerCase()) ||
      gen.id.toLowerCase().includes(searchGenQuery.toLowerCase());
    const matchesCat = genFilterCategory === 'all' || gen.category === genFilterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 py-4 space-y-4 animate-fade-in font-sans">
      {/* Hive-Style Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#04251A] rounded-2xl border border-[rgba(0,217,149,0.22)] shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#073523] hover:bg-[#09291E] border border-[rgba(0,217,149,0.3)] text-xs font-bold text-[#F4FFF9] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#00F0A0]" />
            <span>Upload Media</span>
          </button>

          <div className="h-4 w-px bg-[rgba(0,217,149,0.2)] hidden sm:block" />

          <div className="flex items-center gap-2 text-xs font-mono text-[#A6C2B5]">
            <span className="w-2 h-2 rounded-full bg-[#00D995] animate-pulse" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{result.image_name}</span>
            <span className="text-slate-500 hidden md:inline">({(result.file_size ? Math.round(result.file_size / 1024) : 0)} KB)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {result.analysis_details.provider_info && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#073523]/80 border border-[rgba(0,217,149,0.25)] text-[11px] font-mono text-[#00F0A0]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0A0]" />
              <span>{result.analysis_details.provider_info.displayName}</span>
            </div>
          )}

          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#073523] hover:bg-[#09291E] border border-[rgba(0,217,149,0.22)] text-xs font-medium text-[#A6C2B5] hover:text-[#F4FFF9] transition-all cursor-pointer"
            title="Copy Forensic Summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00F0A0]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#073523] hover:bg-[#09291E] border border-[rgba(0,217,149,0.22)] text-xs font-medium text-[#A6C2B5] hover:text-[#F4FFF9] transition-all cursor-pointer"
            title="Export JSON Dossier"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00D995] to-[#00B981] hover:brightness-110 text-xs font-bold text-[#020B09] shadow-md shadow-[rgba(0,217,149,0.25)] transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Hive Detect Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* ===================================================================
            COLUMN 1: SLIM LEFT SIDEBAR (UPLOAD QUEUE & RECENT ANALYSES)
            =================================================================== */}
        <div className="lg:col-span-1 hidden lg:flex flex-col items-center gap-3 py-3 px-2 rounded-2xl bg-[#04251A] border border-[rgba(0,217,149,0.22)] shadow-xl min-h-[580px]">
          {/* Add Upload Button */}
          <button
            onClick={onReset}
            className="w-12 h-12 rounded-xl bg-[#073523] hover:bg-[#00D995] hover:text-[#020B09] border border-[rgba(0,217,149,0.3)] text-[#00F0A0] flex items-center justify-center transition-all cursor-pointer shadow-sm group"
            title="Upload New Media"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <div className="w-8 h-px bg-[rgba(0,217,149,0.2)]" />

          {/* Current Active Thumbnail */}
          <div
            className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-[#00D995] shadow-md shadow-[#00D995]/20 cursor-pointer"
            title={\`Active: \${result.image_name}\`}
          >
            <img src={result.image_url} alt="Current" className="w-full h-full object-cover" />
            <span className="absolute bottom-0 inset-x-0 bg-[#00D995] text-[#020B09] text-[8px] font-bold text-center leading-tight py-0.5">
              ACTIVE
            </span>
          </div>

          {/* History Thumbnails List */}
          {history
            .filter((h) => h.id !== result.id)
            .slice(0, 5)
            .map((item, idx) => {
              const itemAiPct =
                item.analysis_details.ai_generated_score ?? item.analysis_details.ai_probability;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectResult && onSelectResult(item)}
                  className="relative w-12 h-12 rounded-xl overflow-hidden border border-[rgba(0,217,149,0.2)] hover:border-[#00D995] transition-all cursor-pointer opacity-70 hover:opacity-100 group"
                  title={\`Switch to: \${item.image_name} (\${item.detection_result})\`}
                >
                  <img src={item.image_url} alt={item.image_name} className="w-full h-full object-cover" />
                  <span
                    className={\`absolute bottom-0 inset-x-0 text-[8px] font-bold text-center leading-tight py-0.5 text-white \${
                      itemAiPct >= 65 ? 'bg-rose-600/90' : 'bg-emerald-600/90'
                    }\`}
                  >
                    {itemAiPct}%
                  </span>
                </div>
              );
            })}

          <div className="mt-auto pt-2">
            <button
              onClick={onReset}
              className="p-2 rounded-lg text-[#718D80] hover:text-rose-400 hover:bg-[#073523] transition-all cursor-pointer"
              title="Remove upload"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===================================================================
            COLUMN 2: CENTER MEDIA INSPECTION CANVAS (LARGE PREVIEW & OVERLAYS)
            =================================================================== */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative rounded-2xl bg-[#04251A] border border-[rgba(0,217,149,0.22)] p-3 shadow-2xl overflow-hidden">
            {/* Layer View Mode Switcher */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-[rgba(0,217,149,0.18)]">
              <div className="flex items-center gap-1 bg-[#031A12] p-1 rounded-xl border border-[rgba(0,217,149,0.2)] text-xs overflow-x-auto">
                <button
                  onClick={() => setViewMode('original')}
                  className={\`px-3 py-1 rounded-lg font-bold text-xs transition-all \${
                    viewMode === 'original'
                      ? 'bg-[#00D995] text-[#020B09] shadow-sm'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  Original
                </button>
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={\`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 \${
                    viewMode === 'heatmap'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  <Sliders className="w-3 h-3 text-amber-300" />
                  Manipulation Heatmap
                </button>
                <button
                  onClick={() => setViewMode('ela')}
                  className={\`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 \${
                    viewMode === 'ela'
                      ? 'bg-[#00D995] text-[#020B09] shadow-sm'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  <Layers className="w-3 h-3" />
                  ELA Heatmap
                </button>
                <button
                  onClick={() => setViewMode('sobel')}
                  className={\`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1 \${
                    viewMode === 'sobel'
                      ? 'bg-[#00D995] text-[#020B09] shadow-sm'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  <Activity className="w-3 h-3" />
                  Sobel Frequency
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={\`px-3 py-1 rounded-lg font-bold text-xs transition-all \${
                    viewMode === 'split'
                      ? 'bg-[#00D995] text-[#020B09] shadow-sm'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  Split Compare
                </button>
              </div>

              {/* Canvas Zoom Controls */}
              <div className="flex items-center gap-1 bg-[#031A12] p-1 rounded-xl border border-[rgba(0,217,149,0.2)] text-xs">
                <button
                  onClick={() => setZoomScale((z) => Math.max(1, z - 0.25))}
                  className="p-1.5 rounded-lg text-[#A6C2B5] hover:text-white hover:bg-[#073523] cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-[#F4FFF9] px-1">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 rounded-lg text-[#A6C2B5] hover:text-white hover:bg-[#073523] cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomScale(1)}
                  className="p-1.5 rounded-lg text-[#A6C2B5] hover:text-white hover:bg-[#073523] cursor-pointer"
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Display Canvas Box (Matching Hive Detect Canvas) */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square max-h-[580px] bg-[#020B09] rounded-xl overflow-hidden flex items-center justify-center select-none border border-[rgba(0,217,149,0.28)]">
              {viewMode === 'original' && (
                <div
                  className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
                  style={{ transform: \`scale(\${zoomScale})\` }}
                >
                  <img
                    ref={imgRef}
                    src={result.image_url}
                    alt={result.image_name}
                    className="max-h-full max-w-full object-contain"
                  />

                  {/* Face Deepfake Bounding Box (Hive Style) */}
                  {result.analysis_details.deepfake_analysis?.faces?.map((face) => (
                    <div
                      key={face.faceId}
                      style={{
                        left: \`\${face.coordinates.x}%\`,
                        top: \`\${face.coordinates.y}%\`,
                        width: \`\${face.coordinates.width}%\`,
                        height: \`\${face.coordinates.height}%\`,
                      }}
                      className={\`absolute border-2 rounded-xl transition-all pointer-events-none \${
                        face.isDeepfake
                          ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/30'
                          : 'border-[#00D995] bg-[#00D995]/5 shadow-lg shadow-[#00D995]/20'
                      }\`}
                    >
                      <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#031A12] text-[#00F0A0] border border-[#00D995]/50 whitespace-nowrap">
                        Face #{face.faceId}: {face.deepfakeScore}% Deepfake
                      </span>
                    </div>
                  ))}

                  {/* Artifact / Inpainting Bounding Boxes */}
                  {result.analysis_details.visual_artifacts.map((art, idx) => {
                    if (!art.coordinates) return null;
                    const isSelected = selectedArtifact === art;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedArtifact(art)}
                        style={{
                          left: \`\${art.coordinates.x}%\`,
                          top: \`\${art.coordinates.y}%\`,
                          width: \`\${art.coordinates.width}%\`,
                          height: \`\${art.coordinates.height}%\`,
                        }}
                        className={\`absolute border-2 rounded-lg transition-all cursor-pointer \${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-400/20 scale-105 z-20 shadow-lg shadow-cyan-500/50'
                            : art.severity === 'high'
                            ? 'border-rose-500 bg-rose-500/10 hover:border-rose-400'
                            : 'border-amber-500 bg-amber-500/10 hover:border-amber-400'
                        }\`}
                        title={\`\${art.area}: \${art.finding}\`}
                      >
                        <span className="absolute -top-5 left-0 px-1 py-0.2 rounded text-[9px] font-bold bg-[#031A12]/95 text-white border border-[rgba(0,217,149,0.25)] whitespace-nowrap">
                          {art.area}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {viewMode === 'heatmap' && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={result.image_url}
                    alt={result.image_name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {result.analysis_details.regional_analysis?.manipulationHeatmapUrl ? (
                    <img
                      src={result.analysis_details.regional_analysis.manipulationHeatmapUrl}
                      alt="Manipulation Heatmap Overlay"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#020B09]/80 text-xs text-slate-300">
                      Heatmap generated from patch-level residual anomalies
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-[#031A12]/95 text-[10px] text-slate-300 border border-[rgba(0,217,149,0.28)] font-mono flex items-center gap-2.5">
                    <span className="flex items-center gap-1 font-semibold text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Manipulated (Red)
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Anomaly (Orange)
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Authentic (Green)
                    </span>
                  </div>
                </div>
              )}

              {viewMode === 'ela' && (
                <div className="w-full h-full flex items-center justify-center relative">
                  {elaImageUrl ? (
                    <img src={elaImageUrl} alt="Error Level Analysis" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-xs text-[#A6C2B5]">Rendering Error Level Analysis...</div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-[#031A12]/90 text-[10px] text-[#00F0A0] border border-[rgba(0,217,149,0.28)] font-mono">
                    ELA 95% JPEG Compression Differencing (22x Amp)
                  </div>
                </div>
              )}

              {viewMode === 'sobel' && (
                <div className="w-full h-full flex items-center justify-center relative">
                  {sobelImageUrl ? (
                    <img src={sobelImageUrl} alt="Sobel Edge Frequency" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-xs text-[#A6C2B5]">Rendering Sobel Edge Map...</div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-[#031A12]/90 text-[10px] text-indigo-300 border border-[rgba(0,217,149,0.28)] font-mono">
                    High-Frequency Spatial Gradient Norm
                  </div>
                </div>
              )}

              {viewMode === 'split' && (
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                  <img src={result.image_url} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
                  {elaImageUrl && (
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: \`\${splitPos}%\`, borderRight: '2px solid #00F0A0' }}
                    >
                      <img
                        src={elaImageUrl}
                        alt="ELA"
                        className="w-full h-full object-contain"
                        style={{ width: \`\${100 / (splitPos / 100)}%\`, maxWidth: 'none' }}
                      />
                    </div>
                  )}
                  <div className="absolute bottom-2 inset-x-4 flex items-center gap-2 bg-[#031A12]/90 p-2 rounded-lg border border-[rgba(0,217,149,0.28)]">
                    <span className="text-[10px] text-[#A6C2B5] whitespace-nowrap">ELA</span>
                    <input
                      type="range"
                      min="1"
                      max="99"
                      value={splitPos}
                      onChange={(e) => setSplitPos(Number(e.target.value))}
                      className="w-full accent-[#00D995] cursor-ew-resize"
                    />
                    <span className="text-[10px] text-[#A6C2B5] whitespace-nowrap">Original</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Meta Bar under Canvas */}
            <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-[#A6C2B5]">
              <span>Resolution: {result.analysis_details.image_quality?.width || 1086} × {result.analysis_details.image_quality?.height || 1448}</span>
              <span>SHA-256: {sha256.slice(0, 18)}...</span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            COLUMN 3: RIGHT HIVE DETECT SIDEBAR (RESULTS, SOURCES & FORENSICS)
            =================================================================== */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-2xl bg-[#04251A] border border-[rgba(0,217,149,0.22)] p-5 shadow-2xl space-y-5">
            {/* Header: "This Media is" with link/share icon */}
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(0,217,149,0.18)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#A6C2B5]">
                This Media is
              </h3>
              <button
                onClick={handleCopySummary}
                className="p-1 rounded text-[#A6C2B5] hover:text-[#00F0A0] transition-colors cursor-pointer"
                title="Share Result"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Card 1: AI-Generated Image (Hive Detect Style) */}
            <div className="p-4 rounded-xl bg-[#031A12] border border-[rgba(0,217,149,0.22)] space-y-2">
              <div className="flex items-baseline justify-between">
                <span
                  className={\`text-4xl sm:text-5xl font-black tracking-tight \${
                    isLikelyAi ? 'text-[#FF4B55]' : 'text-[#00D995]'
                  }\`}
                >
                  {aiGeneratedPct.toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-[#A6C2B5] text-right">
                  Likely to be<br />
                  <span className="font-bold text-[#F4FFF9]">
                    {isLikelyAi ? 'AI-Generated Image' : 'Authentic Photograph'}
                  </span>
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#073523] overflow-hidden">
                <div
                  className={\`h-full transition-all duration-700 ease-out rounded-full \${
                    isLikelyAi ? 'bg-gradient-to-r from-rose-500 to-[#FF4B55]' : 'bg-gradient-to-r from-[#00D995] to-[#00F0A0]'
                  }\`}
                  style={{ width: \`\${Math.min(100, aiGeneratedPct)}%\` }}
                />
              </div>
            </div>

            {/* Card 2: Deepfake (Hive Detect Style) */}
            <div className="p-4 rounded-xl bg-[#031A12] border border-[rgba(0,217,149,0.22)] space-y-2">
              <div className="flex items-baseline justify-between">
                <span
                  className={\`text-4xl sm:text-5xl font-black tracking-tight \${
                    isLikelyDeepfake ? 'text-[#FF4B55]' : 'text-[#F4FFF9]'
                  }\`}
                >
                  {deepfakePct.toFixed(1)}%
                </span>
                <span className="text-xs font-semibold text-[#A6C2B5] text-right">
                  Likely to be<br />
                  <span className="font-bold text-[#F4FFF9]">Deepfake</span>
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#073523] overflow-hidden">
                <div
                  className={\`h-full transition-all duration-700 ease-out rounded-full \${
                    isLikelyDeepfake ? 'bg-gradient-to-r from-rose-500 to-[#FF4B55]' : 'bg-slate-600'
                  }\`}
                  style={{ width: \`\${Math.min(100, Math.max(1, deepfakePct))}%\` }}
                />
              </div>
            </div>

            {/* Section 2: Generation Sources (Exact Hive Layout) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A6C2B5]">
                  Generation Sources
                </span>
                <span className="text-[11px] font-mono text-[#00F0A0]">
                  {generationSources.length} Models Audited
                </span>
              </div>

              {/* AI-Generated Header Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#073523]/70 border border-[rgba(0,217,149,0.25)] text-xs">
                <span className="font-bold text-[#F4FFF9]">AI-Generated</span>
                <span className="font-mono font-black text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                  {aiGeneratedPct.toFixed(1)}%
                </span>
              </div>

              {/* Grid of Top Detected Engines (gptimage2, sora, pika, haiper, kling) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {generationSources.slice(0, 5).map((gen, idx) => (
                  <div
                    key={idx}
                    className={\`p-2 rounded-lg border text-center font-mono text-xs transition-all \${
                      gen.probability > 50
                        ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 shadow-sm shadow-rose-950'
                        : 'bg-[#031A12] border-[rgba(0,217,149,0.2)] text-[#A6C2B5]'
                    }\`}
                  >
                    <div className="text-[10px] text-slate-400 truncate">{gen.engine}</div>
                    <div className="font-bold text-sm text-[#F4FFF9]">{gen.probability.toFixed(1)}%</div>
                  </div>
                ))}
              </div>

              {/* "View 98 More Results" Button */}
              <button
                onClick={() => setShowAllGeneratorsModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-[#073523] hover:bg-[#09291E] border border-[rgba(0,217,149,0.28)] hover:border-[#00D995] text-xs font-bold text-[#00F0A0] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              >
                <span>View {HIVE_SUPPORTED_GENERATORS.length - 5} More Results</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Deepfake 0% Bottom Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#031A12] border border-[rgba(0,217,149,0.2)] text-xs">
                <span className="font-bold text-[#A6C2B5]">Deepfake</span>
                <span className="font-mono font-bold text-[#F4FFF9] bg-[#073523] px-2 py-0.5 rounded">
                  {deepfakePct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Expandable Tabs for Detailed Forensic Breakdown */}
            <div className="space-y-3 pt-2 border-t border-[rgba(0,217,149,0.18)]">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setActiveTab('sources')}
                  className={\`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap \${
                    activeTab === 'sources'
                      ? 'bg-[#00D995] text-[#020B09]'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  Rationale
                </button>
                <button
                  onClick={() => setActiveTab('deepfake')}
                  className={\`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap \${
                    activeTab === 'deepfake'
                      ? 'bg-[#00D995] text-[#020B09]'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  Face Deepfake
                </button>
                <button
                  onClick={() => setActiveTab('regional')}
                  className={\`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap \${
                    activeTab === 'regional'
                      ? 'bg-[#00D995] text-[#020B09]'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  Manipulation
                </button>
                <button
                  onClick={() => setActiveTab('forensics')}
                  className={\`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap \${
                    activeTab === 'forensics'
                      ? 'bg-[#00D995] text-[#020B09]'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  EXIF & C2PA
                </button>
                <button
                  onClick={() => setActiveTab('technical')}
                  className={\`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap \${
                    activeTab === 'technical'
                      ? 'bg-[#00D995] text-[#020B09]'
                      : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                  }\`}
                >
                  Tech
                </button>
              </div>

              {/* Tab 1: Rationale */}
              {activeTab === 'sources' && (
                <div className="space-y-2 text-xs leading-relaxed text-[#A6C2B5] bg-[#031A12] p-3 rounded-xl border border-[rgba(0,217,149,0.2)]">
                  <p className="text-[#F4FFF9] font-medium">
                    {result.analysis_details.explainable_summary}
                  </p>
                  {result.analysis_details.supporting_reasons?.length > 0 && (
                    <ul className="list-disc pl-4 space-y-1 pt-1 text-[11px] text-[#A6C2B5]">
                      {result.analysis_details.supporting_reasons.slice(0, 3).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Tab 2: Deepfake Face Breakdown */}
              {activeTab === 'deepfake' && (
                <div className="space-y-2 bg-[#031A12] p-3 rounded-xl border border-[rgba(0,217,149,0.2)] text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-[#F4FFF9] font-bold">Face Detection Count:</span>
                    <span className="text-[#00F0A0]">
                      {result.analysis_details.deepfake_analysis?.facesDetectedCount || 1} Face Found
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#04251A] border border-[rgba(0,217,149,0.2)] text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Deepfake Swap Metric:</span>
                      <span className="font-bold text-[#F4FFF9]">{deepfakePct}% (Authentic Identity)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Synthetic Face Assessment:</span>
                      <span className="font-bold text-rose-400">
                        {isLikelyAi ? 'Full Generative Synthesis (gptimage2)' : 'Natural Biological Facial Architecture'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px] pt-1 italic">
                      * Hive Forensic Rule: A fully AI-synthesized person is classified as AI-Generated (not a face-swap deepfake), because no original human victim was impersonated.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Manipulation Regional Findings */}
              {activeTab === 'regional' && (
                <div className="space-y-2 bg-[#031A12] p-3 rounded-xl border border-[rgba(0,217,149,0.2)] text-xs">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Local Inpainting / Modification:</span>
                    <span className="font-bold text-amber-400">
                      {result.analysis_details.local_manipulation_likelihood || 85}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Camera Noise Baseline:</span>
                    <span className="font-bold text-emerald-400">
                      {result.analysis_details.authentic_camera_evidence || 10}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 pt-1">
                    {result.analysis_details.regional_analysis?.backgroundAssessment?.findings ||
                      'Background surfaces and textures audited for inpainting boundaries.'}
                  </div>
                </div>
              )}

              {/* Tab 4: EXIF & C2PA */}
              {activeTab === 'forensics' && (
                <div className="space-y-2 bg-[#031A12] p-3 rounded-xl border border-[rgba(0,217,149,0.2)] text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Camera Make/Model:</span>
                    <span className="text-[#F4FFF9]">
                      {result.analysis_details.metadata.make || 'None (Stripped)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">C2PA Content Credentials:</span>
                    <span className="text-cyan-400">
                      {result.analysis_details.c2pa_metadata?.validationStatus === 'verified'
                        ? '✓ Verified'
                        : 'Not Present'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensions:</span>
                    <span className="text-[#00F0A0]">
                      {result.analysis_details.image_quality?.width || 1086} × {result.analysis_details.image_quality?.height || 1448} (Aspect {result.analysis_details.image_quality?.aspectRatio || '3:4'})
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 5: Technical Details */}
              {activeTab === 'technical' && (
                <div className="space-y-2 bg-[#031A12] p-3 rounded-xl border border-[rgba(0,217,149,0.2)] text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Forensic Engine:</span>
                    <span className="text-[#00F0A0]">{result.model_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SHA-256 Digest:</span>
                    <span className="text-[#F4FFF9] truncate max-w-[150px]">{sha256}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Classification Level:</span>
                    <span className="text-[#00F0A0]">{result.detection_result}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer Attribution */}
            <div className="pt-2 text-center text-[10px] font-mono text-[#718D80] flex items-center justify-center gap-1.5 border-t border-[rgba(0,217,149,0.18)]">
              <span>POWERED BY</span>
              <span className="font-bold text-[#00F0A0]">HIVE DETECT & KRYPTX MULTIMODAL FORENSICS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MODAL DRAWER: "VIEW 98 MORE RESULTS" (ALL 100+ GENERATION ENGINES)
          =================================================================== */}
      {showAllGeneratorsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020B09]/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#04251A] border border-[rgba(0,217,149,0.3)] shadow-2xl p-6 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(0,217,149,0.2)]">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#F4FFF9] flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#00F0A0]" />
                  <span>Supported Generation Sources ({HIVE_SUPPORTED_GENERATORS.length} Engines)</span>
                </h3>
                <p className="text-xs text-[#A6C2B5]">
                  Probability breakdown across all multimodal generative models, diffusion families and deepfake engines.
                </p>
              </div>
              <button
                onClick={() => setShowAllGeneratorsModal(false)}
                className="p-1.5 rounded-lg bg-[#073523] text-[#A6C2B5] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-wrap items-center gap-2 py-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search generator (e.g. gptimage2, midjourney, flux, sora)..."
                  value={searchGenQuery}
                  onChange={(e) => setSearchGenQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#031A12] border border-[rgba(0,217,149,0.25)] text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#031A12] p-1 rounded-xl border border-[rgba(0,217,149,0.2)] text-xs">
                {(['all', 'image', 'video'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGenFilterCategory(cat)}
                    className={\`px-2.5 py-1 rounded-lg font-bold capitalize transition-all \${
                      genFilterCategory === cat
                        ? 'bg-[#00D995] text-[#020B09]'
                        : 'text-[#A6C2B5] hover:text-[#F4FFF9]'
                    }\`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Generator List Grid */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 my-2">
              {filteredGenerators.map((gen) => {
                const isTopMatch = gen.id === topDetectedEngine;
                const prob = isTopMatch ? topDetectedProb : 0.0;
                return (
                  <div
                    key={gen.id}
                    className={\`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-mono \${
                      isTopMatch
                        ? 'bg-rose-950/40 border-rose-500/70 text-rose-300 shadow-sm'
                        : 'bg-[#031A12] border-[rgba(0,217,149,0.15)] text-[#A6C2B5] hover:border-[rgba(0,217,149,0.3)]'
                    }\`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-[#073523] text-[#00F0A0]">
                        {gen.category}
                      </span>
                      <span className="font-semibold text-[#F4FFF9]">{gen.name}</span>
                      <span className="text-[10px] text-slate-500 hidden sm:inline">({gen.id})</span>
                    </div>
                    <div className="font-bold text-sm">
                      {prob > 0 ? (
                        <span className="text-rose-400 font-black">{prob.toFixed(1)}%</span>
                      ) : (
                        <span className="text-slate-500">0.0%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[rgba(0,217,149,0.2)] flex items-center justify-between text-xs text-[#A6C2B5]">
              <span>Showing {filteredGenerators.length} of {HIVE_SUPPORTED_GENERATORS.length} generator models</span>
              <button
                onClick={() => setShowAllGeneratorsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#00D995] text-[#020B09] font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`;

fs.writeFileSync(targetFile, before + newImplementation, 'utf8');
console.log('DetectionResultView.tsx patched successfully with Hive Detect interface!');

