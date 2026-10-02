"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Nexus3DLogoProps {
  scrollProgress: number; // 0 to 1 across the 3 sections
  onHoverStateChange?: (isHovered: boolean) => void;
}

export function Nexus3DLogo({ scrollProgress, onHoverStateChange }: Nexus3DLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice] = useState(() => {
    if (typeof window !== "undefined") {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }
    return false;
  });

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const jewelMeshRef = useRef<THREE.Mesh | null>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Mouse & Target state for smooth lerping
  const mouse = useRef({ x: 0, y: 0, isDirectHover: false });
  const hoverUv = useRef(new THREE.Vector2(0.5, 0.5));
  const targetHoverUv = useRef(new THREE.Vector2(0.5, 0.5));
  const hoverStrength = useRef(0.0);
  const targetHoverStrength = useRef(0.0);

  const scrollProgressRef = useRef(scrollProgress);
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);



  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);
    cameraRef.current = camera;

    // 2. High-Fidelity ACES-Filmic Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Cybernetic Studio Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const electricBlueRim = new THREE.DirectionalLight(0x00d2ff, 4.0);
    electricBlueRim.position.set(-6, -4, 4);
    scene.add(electricBlueRim);

    const purpleFillLight = new THREE.DirectionalLight(0x9d00ff, 2.5);
    purpleFillLight.position.set(0, -6, 3);
    scene.add(purpleFillLight);

    // 4. Root Transform Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // 5. Authentic Elongated Hexagon Geometry (Nexus Emblem Ratio: Height ~ 1.255 * Width)
    const hexW = 1.75;
    const hexH = hexW * 1.255;
    const halfW = hexW / 2;
    const halfH = hexH / 2;
    const cornerY = halfH * 0.49; // Angle break at y = ~0.49 of height

    const hexShape = new THREE.Shape();
    hexShape.moveTo(0, halfH);
    hexShape.lineTo(halfW, cornerY);
    hexShape.lineTo(halfW, -cornerY);
    hexShape.lineTo(0, -halfH);
    hexShape.lineTo(-halfW, -cornerY);
    hexShape.lineTo(-halfW, cornerY);
    hexShape.closePath();

    const extrudeSettings = {
      depth: 0.32,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    };

    const geometry = new THREE.ExtrudeGeometry(hexShape, extrudeSettings);
    geometry.center();

    // Map UVs continuously across the bounding box so textures align 1:1 on front/back caps
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox!;
    const sizeX = bb.max.x - bb.min.x;
    const sizeY = bb.max.y - bb.min.y;
    const uvAttr = geometry.attributes.uv;
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < uvAttr.count; i++) {
      const u = (posAttr.getX(i) - bb.min.x) / sizeX;
      const v = (posAttr.getY(i) - bb.min.y) / sizeY;
      uvAttr.setXY(i, u, v);
    }
    uvAttr.needsUpdate = true;

    // 6. Textures: Pixel-Perfect Monochromatic & Official Jewels
    const textureLoader = new THREE.TextureLoader();
    const monoTex = textureLoader.load("/logo/nexus_emblem_mono.png");
    monoTex.colorSpace = THREE.SRGBColorSpace;

    const colorTex = textureLoader.load("/logo/nexus_emblem_official.png");
    colorTex.colorSpace = THREE.SRGBColorSpace;

    // 7. Custom Localized Cursor-Reveal Shader Material for Front & Back Caps
    const customShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uMonoMap: { value: monoTex },
        uColorMap: { value: colorTex },
        uHoverUv: { value: new THREE.Vector2(0.5, 0.5) },
        uHoverStrength: { value: 0.0 },
        uHoverRadius: { value: 0.28 },
        uTime: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMonoMap;
        uniform sampler2D uColorMap;
        uniform vec2 uHoverUv;
        uniform float uHoverStrength;
        uniform float uHoverRadius;
        uniform float uTime;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vec4 mono = texture2D(uMonoMap, vUv);
          vec4 color = texture2D(uColorMap, vUv);

          // Discard outside alpha mask
          if (mono.a < 0.02 && color.a < 0.02) {
            discard;
          }

          // Aspect-corrected distance for a localized circular spotlight
          vec2 aspectUv = vec2(vUv.x * 0.8, vUv.y);
          vec2 aspectHover = vec2(uHoverUv.x * 0.8, uHoverUv.y);
          float d = distance(aspectUv, aspectHover);

          // Smooth localized reveal mask
          float feather = 0.12;
          float mask = (1.0 - smoothstep(uHoverRadius - feather, uHoverRadius + feather, d)) * uHoverStrength;

          // Electric chromatic energy ring at the perimeter of the spotlight
          float edgeDist = abs(d - uHoverRadius);
          float edgePulse = sin(uTime * 4.0) * 0.15 + 0.85;
          float ringGlow = (1.0 - smoothstep(0.0, 0.045, edgeDist)) * uHoverStrength * edgePulse;
          vec3 ringColor = mix(vec3(0.0, 0.85, 1.0), vec3(0.65, 0.15, 1.0), sin(d * 18.0 + uTime * 2.5) * 0.5 + 0.5);

          // Blend base monochrome with localized official color
          vec3 finalRgb = mix(mono.rgb, color.rgb, mask) + (ringColor * ringGlow * 1.6);

          // Add physical view-angle Fresnel rim shine
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
          finalRgb += vec3(fresnel * 0.18);

          gl_FragColor = vec4(finalRgb, max(mono.a, color.a));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
    shaderMaterialRef.current = customShaderMaterial;

    // Metallic Obsidian Side Material for Chamfered Bevel Walls
    const bevelSideMaterial = new THREE.MeshStandardMaterial({
      color: 0x141416,
      metalness: 0.92,
      roughness: 0.18,
    });

    // Mesh using multi-material array: [front/back caps, side/bevel walls]
    const jewelMesh = new THREE.Mesh(geometry, [customShaderMaterial, bevelSideMaterial]);
    rootGroup.add(jewelMesh);
    jewelMeshRef.current = jewelMesh;

    // 8. New 3D Style: Precision Titanium Exoskeleton (Floating Hairline Framing Ring)
    const frameScale = 1.07;
    const framePts = [
      new THREE.Vector3(0, halfH * frameScale, 0),
      new THREE.Vector3(halfW * frameScale, cornerY * frameScale, 0),
      new THREE.Vector3(halfW * frameScale, -cornerY * frameScale, 0),
      new THREE.Vector3(0, -halfH * frameScale, 0),
      new THREE.Vector3(-halfW * frameScale, -cornerY * frameScale, 0),
      new THREE.Vector3(-halfW * frameScale, cornerY * frameScale, 0),
    ];
    const frameGeomFront = new THREE.BufferGeometry().setFromPoints(framePts);
    const frameMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
    });

    const frontWireframe = new THREE.LineLoop(frameGeomFront, frameMat);
    frontWireframe.position.z = 0.22;
    rootGroup.add(frontWireframe);

    const backWireframe = new THREE.LineLoop(frameGeomFront, frameMat);
    backWireframe.position.z = -0.22;
    rootGroup.add(backWireframe);

    // Corner Diamond Nodes on the exoskeleton
    const nodeGeom = new THREE.OctahedronGeometry(0.04, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x00d2ff,
      emissiveIntensity: 0.3,
    });
    for (const pt of framePts) {
      const nodeFront = new THREE.Mesh(nodeGeom, nodeMat);
      nodeFront.position.set(pt.x, pt.y, 0.22);
      rootGroup.add(nodeFront);

      const nodeBack = new THREE.Mesh(nodeGeom, nodeMat);
      nodeBack.position.set(pt.x, pt.y, -0.22);
      rootGroup.add(nodeBack);
    }

    // 9. Raycaster for Cursor Proximity & Localized UV Spotting
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !jewelMeshRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouse.current.x = (clientX / rect.width) * 2 - 1;
      mouse.current.y = -(clientY / rect.height) * 2 + 1;

      mouseVector.x = mouse.current.x;
      mouseVector.y = mouse.current.y;

      // Raycast against the jewel mesh
      raycaster.setFromCamera(mouseVector, cameraRef.current);
      const intersects = raycaster.intersectObject(jewelMeshRef.current);
      const directHover = intersects.length > 0;

      if (directHover && intersects[0].uv) {
        // Point localized spotlight at cursor hit UV
        targetHoverUv.current.copy(intersects[0].uv);
        targetHoverStrength.current = 1.0;
      } else {
        targetHoverStrength.current = 0.0;
      }

      if (directHover !== mouse.current.isDirectHover) {
        mouse.current.isDirectHover = directHover;
        setIsHovered(directHover);
        onHoverStateChange?.(directHover);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Current animated pose refs for silky smooth exponential glide
    const currentPose = {
      x: 3.0,
      y: 0,
      scale: 0.72, // Sleek, refined, smaller base scale
      rotX: 0,
      rotY: 0,
    };

    // 10. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smoothly lerp localized hover UV and hover strength into shader uniforms
      hoverUv.current.lerp(targetHoverUv.current, 0.16);
      hoverStrength.current += (targetHoverStrength.current - hoverStrength.current) * 0.12;

      if (shaderMaterialRef.current) {
        shaderMaterialRef.current.uniforms.uHoverUv.value.copy(hoverUv.current);
        shaderMaterialRef.current.uniforms.uHoverStrength.value = hoverStrength.current;
        shaderMaterialRef.current.uniforms.uTime.value = elapsedTime;
      }

      if (rootGroupRef.current && cameraRef.current) {
        const aspect = cameraRef.current.aspect;

        // Subtle floating idle motion
        const floatY = Math.sin(elapsedTime * 1.3) * 0.055;

        // Calculate Proximity Tilt based on cursor position relative to mesh
        const tiltIntensity = mouse.current.isDirectHover ? 0.32 : 0.18;
        const targetRotX = mouse.current.y * tiltIntensity;
        const targetRotY = mouse.current.x * tiltIntensity + (isTouchDevice ? Math.sin(elapsedTime * 0.8) * 0.2 : 0);

        // Smooth exponential lerping for rotation
        currentPose.rotX += (targetRotX - currentPose.rotX) * 0.07;
        currentPose.rotY += (targetRotY - currentPose.rotY) * 0.07;
        rootGroupRef.current.rotation.x = currentPose.rotX;
        rootGroupRef.current.rotation.y = currentPose.rotY;
        rootGroupRef.current.rotation.z = Math.sin(elapsedTime * 0.35) * 0.02;

        // Counter-rotate the exoskeleton frame subtly for dynamic parallax depth
        frontWireframe.rotation.z = Math.sin(elapsedTime * 0.5) * 0.04;
        backWireframe.rotation.z = -Math.sin(elapsedTime * 0.5) * 0.04;

        // Position & Scale Across Sections:
        // Base scale: 0.72 (compact & jewel-like, refined down from 1.0)
        // Section 3 scale: 0.44 (comfortably elevated above the headline)
        const p = Math.max(0, Math.min(1, scrollProgressRef.current));
        const sideX = Math.min(3.1, Math.max(2.3, aspect * 1.6));

        let targetX = sideX;
        let targetY = floatY;
        let targetScale = 0.72;

        if (p < 0.46) {
          // Section 1 -> Section 2: Right to Left
          const t = Math.max(0, Math.min(1, (p - 0.10) / 0.28));
          const smoothT = t * t * (3 - 2 * t);
          targetX = THREE.MathUtils.lerp(sideX, -sideX, smoothT);
          targetY = floatY;
          targetScale = 0.72;
        } else {
          // Section 2 -> Section 3: Left to Upper Center
          const t = Math.max(0, Math.min(1, (p - 0.54) / 0.36));
          const smoothT = t * t * (3 - 2 * t);
          targetX = THREE.MathUtils.lerp(-sideX, 0.0, smoothT);
          targetY = THREE.MathUtils.lerp(floatY, 1.85, smoothT);
          targetScale = THREE.MathUtils.lerp(0.72, 0.44, smoothT);
        }

        // Narrow viewports / mobile adjustment
        if (aspect < 1.1) {
          targetX = 0;
          targetY = p > 0.65 ? 1.85 : 1.2;
          targetScale = 0.40;
        }

        if (mouse.current.isDirectHover) {
          targetScale *= 1.05;
        }

        // Cinematic exponential damping
        currentPose.x += (targetX - currentPose.x) * 0.065;
        currentPose.y += (targetY - currentPose.y) * 0.065;
        currentPose.scale += (targetScale - currentPose.scale) * 0.065;

        rootGroupRef.current.position.set(currentPose.x, currentPose.y, 0);
        rootGroupRef.current.scale.set(currentPose.scale, currentPose.scale, currentPose.scale);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      geometry.dispose();
      customShaderMaterial.dispose();
      bevelSideMaterial.dispose();
      frameGeomFront.dispose();
      frameMat.dispose();
      nodeGeom.dispose();
      nodeMat.dispose();
      monoTex.dispose();
      colorTex.dispose();
    };
  }, [isTouchDevice, onHoverStateChange]);

  return (
    <div className="relative w-full h-full pointer-events-none">
      <div ref={containerRef} className="w-full h-full pointer-events-none" />
      {/* Discreet indicator pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300">
        <span className="hv-kicker text-[10px] px-3.5 py-1 rounded-full border border-hairline bg-paper/60 backdrop-blur-sm">
          {isHovered ? "LOCALIZED CHROMA PROJECTION // ACTIVE" : "MONOCHROME BRUTALISM // HOVER TO REVEAL"}
        </span>
      </div>
    </div>
  );
}
