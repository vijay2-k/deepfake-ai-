import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, Activity, Cpu, RotateCcw } from 'lucide-react';

interface HolographicHero3DProps {
  className?: string;
  onExploreDemo?: () => void;
}

export const HolographicHero3D: React.FC<HolographicHero3DProps> = ({
  className = '',
  onExploreDemo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStage, setCurrentStage] = useState<number>(5);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [stageProgress, setStageProgress] = useState<number>(100);
  const [fps, setFps] = useState<number>(60);

  const stageRef = useRef<number>(5);
  const isPlayingRef = useRef<boolean>(true);

  useEffect(() => {
    stageRef.current = currentStage;
  }, [currentStage]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 520;

    // 1. Scene, Camera, Renderer (Visible Dark Emerald Palette)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04251a, 0.035);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 7.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup (Emerald Forensic Laboratory Lighting)
    const ambientLight = new THREE.AmbientLight(0x073523, 3.2);
    scene.add(ambientLight);

    const keyEmeraldLight = new THREE.DirectionalLight(0x00d995, 3.4);
    keyEmeraldLight.position.set(3, 4, 5);
    scene.add(keyEmeraldLight);

    const rimBrightGreenLight = new THREE.DirectionalLight(0x00f0a0, 2.8);
    rimBrightGreenLight.position.set(-4, 2, -3);
    scene.add(rimBrightGreenLight);

    const platformForestGlow = new THREE.PointLight(0x00b981, 1.6, 12);
    platformForestGlow.position.set(0, -1.5, 2);
    scene.add(platformForestGlow);

    // 3. Stage 1 — Holographic Platform & Floor
    const platformGroup = new THREE.Group();
    scene.add(platformGroup);

    // Outer Circular Platform Rings
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00d995,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
      wireframe: true,
    });
    const platformRing1 = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.7, 64), ringMat1);
    platformRing1.rotation.x = -Math.PI / 2;
    platformRing1.position.y = -1.65;
    platformGroup.add(platformRing1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x00b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const platformRing2 = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.75, 48), ringMat2);
    platformRing2.rotation.x = -Math.PI / 2;
    platformRing2.position.y = -1.64;
    platformGroup.add(platformRing2);

    // Platform Collar Cylinder
    const collarGeo = new THREE.CylinderGeometry(1.3, 1.45, 0.25, 32, 1, true);
    const collarMat = new THREE.MeshBasicMaterial({
      color: 0x00d995,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const platformCollar = new THREE.Mesh(collarGeo, collarMat);
    platformCollar.position.y = -1.75;
    platformGroup.add(platformCollar);

    // Floor Grid in Emerald & Forest Green
    const gridHelper = new THREE.GridHelper(10, 24, 0x00d995, 0x071d17);
    gridHelper.position.y = -1.66;
    // @ts-ignore
    gridHelper.material.transparent = true;
    // @ts-ignore
    gridHelper.material.opacity = 0.35;
    scene.add(gridHelper);

    // Floating Ground Energy Particles (Mint Green)
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 2.4;
      particlePos[i * 3] = Math.cos(angle) * radius;
      particlePos[i * 3 + 1] = -1.65 + Math.random() * 3.4;
      particlePos[i * 3 + 2] = Math.sin(angle) * radius;
      particleSpeeds[i] = 0.006 + Math.random() * 0.015;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0a0,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 4. Stage 2 — Structural Framework Elements
    const structureGroup = new THREE.Group();
    scene.add(structureGroup);

    const columnGeo = new THREE.CylinderGeometry(0.035, 0.035, 3.4, 8);
    const columnMat = new THREE.MeshBasicMaterial({
      color: 0x00b981,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });

    const colPositions = [
      [1.9, 0, 1.9],
      [-1.9, 0, 1.9],
      [1.9, 0, -1.9],
      [-1.9, 0, -1.9],
    ];

    const columns: THREE.Mesh[] = [];
    colPositions.forEach(([cx, cy, cz]) => {
      const col = new THREE.Mesh(columnGeo, columnMat);
      col.position.set(cx, cy, cz);
      structureGroup.add(col);
      columns.push(col);
    });

    const hexRingGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.05, 6, 1, true);
    const hexRingMat = new THREE.MeshBasicMaterial({
      color: 0x00d995,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const hexPlate = new THREE.Mesh(hexRingGeo, hexRingMat);
    hexPlate.position.y = 1.5;
    structureGroup.add(hexPlate);

    // 5. Stage 3, 4, 5 — REALISTIC 3D HOLOGRAPHIC HUMAN HEAD (Sculpted Geometry)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.1, 0);
    scene.add(headGroup);

    const latBands = 44;
    const lonBands = 48;
    const headVertices: number[] = [];
    const headIndices: number[] = [];
    const landmarkVertices: number[] = [];

    for (let lat = 0; lat <= latBands; lat++) {
      const v = lat / latBands;
      const phi = v * Math.PI;

      for (let lon = 0; lon <= lonBands; lon++) {
        const u = lon / lonBands;
        const theta = u * Math.PI * 2;

        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        let rx = 0.88 * Math.sin(phi);
        let ry = 1.25 * cosPhi;
        let rz = 1.05 * Math.sin(phi);

        const isFront = cosTheta > 0.05;
        const frontFactor = Math.max(0, cosTheta);
        const absX = Math.abs(sinTheta);

        if (ry > 0.35) {
          if (!isFront) {
            rz *= 1.22;
          } else {
            const browWeight = Math.exp(-Math.pow((ry - 0.42) / 0.14, 2));
            rz += frontFactor * (0.12 + browWeight * 0.18);
          }
        } else if (ry > 0.12 && ry <= 0.35) {
          if (isFront) {
            const eyeXDist = Math.abs(absX - 0.48);
            const inSocket = Math.exp(-Math.pow(eyeXDist / 0.18, 2)) * Math.exp(-Math.pow((ry - 0.24) / 0.1, 2));
            rz -= inSocket * 0.24;

            if (absX < 0.18) {
              const rootWeight = Math.exp(-Math.pow(absX / 0.12, 2));
              rz += rootWeight * 0.26;
              rx *= 0.72;
            }
          }
        } else if (ry > -0.18 && ry <= 0.12) {
          if (isFront) {
            const cheekWeight = Math.exp(-Math.pow((absX - 0.68) / 0.22, 2)) * Math.exp(-Math.pow((ry - 0.02) / 0.12, 2));
            rx += cheekWeight * 0.16;
            rz += cheekWeight * 0.12;

            if (absX < 0.24) {
              const noseDist = Math.hypot(absX * 3.5, (ry - (-0.05)) * 4.0);
              const noseWeight = Math.max(0, 1.0 - noseDist);
              rz += noseWeight * 0.58;
              rx *= 0.65;
            }
          }
        } else if (ry > -0.48 && ry <= -0.18) {
          if (isFront) {
            const mouthWidth = Math.exp(-Math.pow(absX / 0.35, 2));
            const upperLip = Math.exp(-Math.pow((ry - (-0.26)) / 0.08, 2)) * mouthWidth;
            const lowerLip = Math.exp(-Math.pow((ry - (-0.38)) / 0.08, 2)) * mouthWidth;
            const oralSlit = Math.exp(-Math.pow((ry - (-0.32)) / 0.04, 2)) * mouthWidth;

            rz += (upperLip * 0.22 + lowerLip * 0.24) - oralSlit * 0.12;

            if (ry < -0.42) {
              rz -= mouthWidth * 0.08;
            }
          }
          rx *= 0.85;
        } else if (ry > -0.85 && ry <= -0.48) {
          if (isFront) {
            const chinWeight = Math.exp(-Math.pow(absX / 0.26, 2)) * Math.exp(-Math.pow((ry - (-0.62)) / 0.12, 2));
            rz += chinWeight * 0.36;
          }
          const jawTaper = Math.min(1.0, (ry - (-0.85)) / 0.37);
          rx *= 0.68 + jawTaper * 0.18;
          if (!isFront) {
            rz *= 0.88;
          }
        } else if (ry <= -0.85) {
          rx = 0.52 + Math.sin(phi) * 0.12;
          rz = 0.56 + Math.sin(phi) * 0.12;
        }

        const px = rx * sinTheta;
        const py = ry;
        const pz = rz * cosTheta;

        headVertices.push(px, py, pz);

        if (isFront) {
          const isLandmarkRow =
            Math.abs(ry - 0.42) < 0.04 ||
            Math.abs(ry - 0.24) < 0.04 ||
            Math.abs(ry - (-0.05)) < 0.04 ||
            Math.abs(ry - (-0.26)) < 0.04 ||
            Math.abs(ry - (-0.38)) < 0.04 ||
            Math.abs(ry - (-0.62)) < 0.04;

          if (isLandmarkRow && absX < 0.7) {
            landmarkVertices.push(px, py, pz);
          }
        }
      }
    }

    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < lonBands; lon++) {
        const first = lat * (lonBands + 1) + lon;
        const second = first + lonBands + 1;

        headIndices.push(first, second, first + 1);
        headIndices.push(second, second + 1, first + 1);
      }
    }

    const headGeometry = new THREE.BufferGeometry();
    headGeometry.setAttribute('position', new THREE.Float32BufferAttribute(headVertices, 3));
    headGeometry.setIndex(headIndices);
    headGeometry.computeVertexNormals();

    // Layer 1: Translucent Emerald Solid Surface
    const headSurfaceMat = new THREE.MeshPhysicalMaterial({
      color: 0x052d20,
      emissive: 0x073523,
      roughness: 0.28,
      metalness: 0.6,
      transmission: 0.65,
      opacity: 0.85,
      transparent: true,
      side: THREE.DoubleSide,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
    });
    const headSurfaceMesh = new THREE.Mesh(headGeometry, headSurfaceMat);
    headGroup.add(headSurfaceMesh);

    // Layer 2: Precision Emerald Cyber Wireframe Overlay
    const headWireMat = new THREE.MeshBasicMaterial({
      color: 0x00d995,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    });
    const headWireMesh = new THREE.Mesh(headGeometry, headWireMat);
    headGroup.add(headWireMesh);

    // Layer 3: Eyeballs (Bilateral holographic spheres in sockets)
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0x00d995,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.36, 0.24, 0.72);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.36, 0.24, 0.72);
    headGroup.add(rightEye);

    // Glowing Pupils
    const pupilGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x00f0a0 });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.36, 0.24, 0.82);
    headGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.36, 0.24, 0.82);
    headGroup.add(rightPupil);

    // Layer 4: Biometric Landmark Nodes (Point Cloud in Mint Green)
    const landmarkGeo = new THREE.BufferGeometry();
    landmarkGeo.setAttribute('position', new THREE.Float32BufferAttribute(landmarkVertices, 3));
    const landmarkMat = new THREE.PointsMaterial({
      color: 0x00f0a0,
      size: 0.05,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const landmarkPoints = new THREE.Points(landmarkGeo, landmarkMat);
    headGroup.add(landmarkPoints);

    // Layer 5: Vertical Scanning Laser Bar
    const scanLaserGeo = new THREE.PlaneGeometry(3.2, 0.06);
    const scanLaserMat = new THREE.MeshBasicMaterial({
      color: 0x00f0a0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const scanLaser = new THREE.Mesh(scanLaserGeo, scanLaserMat);
    scanLaser.rotation.x = Math.PI / 2;
    headGroup.add(scanLaser);

    // 6. Stage 5 — Floating Forensic Telemetry Panels (Emerald & Mint Theme)
    const panelsGroup = new THREE.Group();
    scene.add(panelsGroup);

    const panelConfigs = [
      { name: 'FACIAL GEOMETRY', x: 2.2, y: 0.6, z: 0.8, color: 0x00d995, rotY: -0.35 },
      { name: 'SYNTHETIC ARTIFACTS', x: -2.3, y: 0.7, z: 0.5, color: 0x00f0a0, rotY: 0.4 },
      { name: 'FREQUENCY SPECTRUM', x: 2.1, y: -0.5, z: 1.1, color: 0x00b981, rotY: -0.25 },
      { name: 'NEURAL COHERENCE', x: -2.1, y: -0.6, z: 0.9, color: 0x00d995, rotY: 0.3 },
    ];

    panelConfigs.forEach((cfg) => {
      const panelMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 0.75),
        new THREE.MeshBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
        })
      );
      panelMesh.position.set(cfg.x, cfg.y, cfg.z);
      panelMesh.rotation.y = cfg.rotY;

      // Outer border wireframe
      const borderEdges = new THREE.EdgesGeometry(panelMesh.geometry);
      const borderLine = new THREE.LineSegments(
        borderEdges,
        new THREE.LineBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.6 })
      );
      panelMesh.add(borderLine);

      panelsGroup.add(panelMesh);
    });

    // 7. Interactive Controls & Mouse Orbit Tracking
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetCameraX = 0;
    let targetCameraY = 0.8;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      targetCameraX = nx * 1.2;
      targetCameraY = 0.8 + ny * 0.6;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        headGroup.rotation.y += deltaX * 0.008;
        headGroup.rotation.x += deltaY * 0.005;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    let animationId: number;
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let autoStageTimer = 18;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      frameCount++;
      if (performance.now() - lastFpsTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFpsTime = performance.now();
      }

      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0.1, 0);

      if (isPlayingRef.current) {
        if (autoStageTimer < 20) {
          autoStageTimer += delta;
          const cycleDuration = 20;
          const progressNormalized = Math.min(1.0, autoStageTimer / cycleDuration);
          setStageProgress(Math.round(progressNormalized * 100));

          let calculatedStage = 1;
          if (progressNormalized > 0.15 && progressNormalized <= 0.35) calculatedStage = 2;
          else if (progressNormalized > 0.35 && progressNormalized <= 0.6) calculatedStage = 3;
          else if (progressNormalized > 0.6 && progressNormalized <= 0.85) calculatedStage = 4;
          else if (progressNormalized > 0.85) calculatedStage = 5;

          if (calculatedStage !== stageRef.current) {
            setCurrentStage(calculatedStage);
            stageRef.current = calculatedStage;
          }
        } else {
          if (stageRef.current !== 5) {
            setCurrentStage(5);
            stageRef.current = 5;
          }
          setStageProgress(100);
        }
      }

      const activeStage = stageRef.current;

      platformRing1.rotation.z += 0.003;
      platformRing2.rotation.z -= 0.006;

      const pos = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += particleSpeeds[i];
        if (pos[i * 3 + 1] > 2.8) {
          pos[i * 3 + 1] = -1.65;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      structureGroup.visible = activeStage >= 2;
      if (structureGroup.visible) {
        hexPlate.rotation.y = time * 0.25;
        columns.forEach((col, idx) => {
          col.position.y = Math.sin(time * 2 + idx) * 0.06;
        });
      }

      headGroup.visible = activeStage >= 3;
      if (headGroup.visible) {
        if (!isDragging) {
          headGroup.rotation.y = time * 0.22;
        }

        const scanY = Math.sin(time * 2.0) * 1.25;
        scanLaser.position.y = scanY;

        if (activeStage === 3) {
          headSurfaceMesh.visible = false;
          headWireMesh.visible = true;
          headWireMat.opacity = 0.45 + Math.sin(time * 3) * 0.15;
          landmarkPoints.visible = true;
          leftPupil.visible = false;
          rightPupil.visible = false;
        } else if (activeStage === 4) {
          headSurfaceMesh.visible = true;
          headWireMesh.visible = true;
          headSurfaceMat.opacity = 0.8;
          headWireMat.opacity = 0.38;
          landmarkPoints.visible = true;
          leftPupil.visible = true;
          rightPupil.visible = true;
        } else if (activeStage === 5) {
          headSurfaceMesh.visible = true;
          headWireMesh.visible = true;
          headSurfaceMat.opacity = 0.88;
          headWireMat.opacity = 0.42;
          landmarkPoints.visible = true;
          leftPupil.visible = true;
          rightPupil.visible = true;
        }
      }

      panelsGroup.visible = activeStage >= 5;
      if (panelsGroup.visible) {
        panelsGroup.children.forEach((child, i) => {
          child.position.y += Math.sin(time * 1.5 + i) * 0.002;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const stages = [
    { num: 1, name: 'Foundation', desc: 'Platform & Matrix Grid' },
    { num: 2, name: 'Structure', desc: 'Architectural Framework' },
    { num: 3, name: 'Reconstruction', desc: 'Wireframe & Landmarks' },
    { num: 4, name: 'Human Model', desc: 'Full Holographic Head' },
    { num: 5, name: 'Intelligence', desc: 'Forensic Multi-Vectors' },
  ];

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-[#E4DEFF] bg-gradient-to-b from-white via-[#F8F7FF] to-white shadow-[0_0_60px_-10px_rgba(85,21,216,0.15)] backdrop-blur-xl ${className}`}
    >
      {/* Top Header HUD Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-3 border-b border-[#E4DEFF] bg-[#F8F7FF] backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5515D8]/10 border border-[#E4DEFF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5515D8] animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#5515D8]" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#5515D8] uppercase">
              3D HOLOGRAPHIC LABORATORY
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#525779] hidden sm:inline">
            RECONSTRUCTED HUMAN INTELLIGENCE
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-[#525779]">
          <span className="px-2 py-0.5 rounded bg-[#0B3526] border border-[#E4DEFF] text-[10px] text-[#5515D8] font-bold">
            {fps} FPS
          </span>
          <button
            onClick={() => {
              setCurrentStage(1);
              stageRef.current = 1;
              setIsPlaying(true);
            }}
            className="p-1 rounded bg-[#0B3526] hover:bg-[#5515D8]/20 text-[#525779] hover:text-[#5515D8] transition-colors border border-[#E4DEFF]"
            title="Replay Construction Sequence"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Three.js Canvas Mount */}
      <div
        ref={containerRef}
        className="w-full h-[380px] sm:h-[460px] lg:h-[520px] cursor-grab active:cursor-grabbing"
      />

      {/* Floating Holographic Telemetry Badges */}
      <div className="absolute top-14 left-4 z-10 pointer-events-none hidden sm:block">
        <div className="px-3 py-2 rounded-xl bg-white border border-[#E4DEFF] backdrop-blur-md space-y-1 shadow-lg shadow-[#5515D8]/10">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5515D8]">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>BIOMETRIC MESH: 3,000 VERTICES</span>
          </div>
          <div className="text-[10px] font-mono text-[#525779]">
            FACIAL PROPORTIONS: ANATOMICALLY CALIBRATED
          </div>
          <div className="text-[10px] font-mono text-[#5515D8] font-semibold">
            STATUS: 3D HOLOGRAPHIC HEAD ASSEMBLED
          </div>
        </div>
      </div>

      <div className="absolute top-14 right-4 z-10 pointer-events-none hidden sm:block">
        <div className="px-3 py-2 rounded-xl bg-white border border-[#E4DEFF] backdrop-blur-md space-y-1 text-right shadow-lg shadow-[#5515D8]/10">
          <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-[#5515D8]">
            <span>NEURAL RESIDUAL: &lt;0.012</span>
            <Cpu className="w-3 h-3" />
          </div>
          <div className="text-[10px] font-mono text-[#525779]">
            OPTICAL COHERENCE: 99.4%
          </div>
          <div className="text-[10px] font-mono text-[#5515D8] font-bold">
            VERDICT: HOLOGRAPHIC CORE ACTIVE
          </div>
        </div>
      </div>

      {/* Core Mission Banner */}
      <div className="absolute bottom-16 inset-x-0 z-10 flex justify-center pointer-events-none px-4">
        <div className="px-4 py-1.5 rounded-full bg-white border border-[#E4DEFF] backdrop-blur-md shadow-lg shadow-[#5515D8]/10 text-center">
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase bg-gradient-to-r from-[#5515D8] via-[#8B32FF] to-[#1677FF] bg-clip-text text-transparent">
            "WE BUILD INTELLIGENCE TO EXPOSE SYNTHETIC REALITY."
          </span>
        </div>
      </div>

      {/* Bottom Stage Timeline Controls */}
      <div className="absolute bottom-0 inset-x-0 z-20 px-3 py-2.5 border-t border-[#E4DEFF] bg-white backdrop-blur-md">
        {/* Progress bar line */}
        <div className="w-full h-1 bg-white rounded-full mb-2 overflow-hidden border border-[#E4DEFF]">
          <div
            className="h-full bg-gradient-to-r from-[#1677FF] via-[#5515D8] to-[#8B32FF] transition-all duration-300 rounded-full"
            style={{ width: `${stageProgress}%` }}
          />
        </div>

        {/* Stage Selector Buttons */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {stages.map((stg) => {
            const isActive = currentStage === stg.num;
            return (
              <button
                key={stg.num}
                onClick={() => {
                  setCurrentStage(stg.num);
                  stageRef.current = stg.num;
                  setIsPlaying(false);
                }}
                className={`flex flex-col items-center py-1 px-1 sm:px-2 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-[#5515D8]/10 border border-[#5515D8]/60 text-[#5515D8] shadow-[0_0_12px_rgba(0,217,149,0.25)]'
                    : 'bg-[#F8F7FF] border border-[#E4DEFF] text-[#525779] hover:border-[rgba(0,217,149,0.45)] hover:text-[#10132F]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`w-3.5 h-3.5 rounded-full text-[9px] font-mono flex items-center justify-center font-bold ${
                      isActive
                        ? 'bg-[#5515D8] text-white'
                        : 'bg-[#0B3526] text-[#525779]'
                    }`}
                  >
                    {stg.num}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold truncate">
                    {stg.name}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#8C90A8] hidden md:block truncate mt-0.5">
                  {stg.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
