"use client"

import { useEffect, useState, useRef, Suspense, useMemo } from "react"
import React from 'react'
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber"
import { Text, Html, Plane, OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import * as THREE from "three"
import { Loader2, ChevronUp, ChevronDown } from "lucide-react"
import { createRoot } from 'react-dom/client'
import { BottomNav } from "@/components/bottom-nav"

interface DreamEntry {
  id: string
  title: string
  date: string
  location: string
  emotion: string
  summary: string
  people?: string
}

// Create a custom shader material for water ripples
class RippleShaderMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        playerPos: { value: new THREE.Vector2(0, 0) },
        prevPlayerPos: { value: new THREE.Vector2(0, 0) },
        movementFactor: { value: 0.0 },
        trailPositions: { value: Array(8).fill(0).map(() => new THREE.Vector2(0, 0)) }, // Ensure 8 properly initialized Vector2 objects
        trailTimes: { value: Array(8).fill(0.0) }, // 8 trail times
        dreamPoints: { value: Array(20).fill(0).map(() => new THREE.Vector2(0, 0)) }, // Ensure 20 properly initialized Vector2 objects
        resolution: { value: new THREE.Vector2(1, 1) },
        rippleStrength: { value: 0.5 },
        dreamRippleStrength: { value: 0.3 },
        rippleSpeed: { value: 0.25 },
        maxRippleRadius: { value: 0.008 },
        dreamRippleRadius: { value: 0.006 },
        rippleWidth: { value: 0.0002 },
        dreamRippleWidth: { value: 0.00015 },
        rippleColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
        dreamRippleColor: { value: new THREE.Color(0.9, 0.9, 1.0) },
        gridColor: { value: new THREE.Color(0x333333) },
        baseColor: { value: new THREE.Color(0x111111) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 playerPos;
        uniform vec2 prevPlayerPos;
        uniform float movementFactor;
        uniform vec2 trailPositions[8]; // Increased to 8 trail positions
        uniform float trailTimes[8]; // Increased to 8 trail times
        uniform vec2 dreamPoints[20];
        uniform vec2 resolution;
        uniform float rippleStrength;
        uniform float dreamRippleStrength;
        uniform float rippleSpeed;
        uniform float maxRippleRadius;
        uniform float dreamRippleRadius;
        uniform float rippleWidth;
        uniform float dreamRippleWidth;
        uniform vec3 rippleColor;
        uniform vec3 dreamRippleColor;
        uniform vec3 gridColor;
        uniform vec3 baseColor;
        varying vec2 vUv;
        
        float grid(vec2 uv, float size) {
          vec2 grid = fract(uv * size);
          return step(0.98, grid.x) + step(0.98, grid.y);
        }
        
        // Function to create a sharp, thin, bright line
        float sharpLine(float dist, float timeOffset, float width, float maxRadius, float age) {
          float t = mod(time * rippleSpeed + timeOffset, 1.0);
          float radius = t * maxRadius;
          
          // Very sharp line with minimal feathering
          float x = (dist - radius) / (width * 0.5);
          float sharpLine = exp(-x*x * 10.0);
          
          // Enhance the line's visibility with a power function
          sharpLine = pow(sharpLine, 0.5);
          
          // Fade out based on time and age
          float fadeOut = 1.0 - smoothstep(0.7, 0.95, t);
          
          // Additional fade based on age (for trail points)
          float ageFade = 1.0;
          if (age > 0.0) {
            ageFade = 1.0 - smoothstep(0.0, 2.0, age); // Longer trail visibility
          }
          
          return sharpLine * fadeOut * ageFade;
        }

        void main() {
          // Current position ripple
          float currentDist = distance(vUv, playerPos);
          float playerRipple = 0.0;
          
          // Only show current ripple when moving
          if (movementFactor > 0.01 && currentDist < maxRippleRadius * 1.5) {
            playerRipple += sharpLine(currentDist, 0.0, rippleWidth, maxRippleRadius, 0.0) * 
                           rippleStrength * movementFactor;
          }
          
          // Trail ripples from previous positions - these continue even when stopped
          for (int i = 0; i < 8; i++) { // Increased to 8 trail positions
            if (trailTimes[i] > 0.0) { // Only process valid trail points
              float trailDist = distance(vUv, trailPositions[i]);
              if (trailDist < maxRippleRadius * 1.5) {
                // Calculate age of this trail point
                float age = time - trailTimes[i];
                
                // Different phase for each trail position
                float timeOffset = 0.1 + float(i) * 0.1; // Adjusted spacing for more positions
                
                // Fade out older trail positions more gradually
                float trailStrength = rippleStrength * (1.0 - float(i) * 0.1); // Slower decay for longer trail
                
                // Add this trail ripple
                playerRipple += sharpLine(trailDist, timeOffset, rippleWidth, maxRippleRadius, age) * trailStrength;
              }
            }
          }
          
          // Create ripples for dream points (more subtle)
          float dreamRipple = 0.0;
          for (int i = 0; i < 20; i++) {
            if (dreamPoints[i].x == 0.0 && dreamPoints[i].y == 0.0) continue;
            
            float dreamDist = distance(vUv, dreamPoints[i]);
            if (dreamDist < dreamRippleRadius * 1.5) {
              float phase = dreamPoints[i].x * 10.0 + dreamPoints[i].y * 10.0;
              float offset = mod(phase, 1.0);
              dreamRipple += sharpLine(dreamDist, offset, dreamRippleWidth, dreamRippleRadius, 0.0) * dreamRippleStrength;
            }
          }
          
          // Create grid
          float gridPattern = grid(vUv, 10.0) * 0.3;
          
          // Combine all effects
          vec3 color = mix(baseColor, gridColor, gridPattern);
          
          // Apply player ripples with pure white
          if (playerRipple > 0.0) {
            color = mix(color, rippleColor, playerRipple);
          }
          
          // Apply dream ripples with slightly blue-white
          if (dreamRipple > 0.0) {
            color = mix(color, dreamRippleColor, dreamRipple);
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true
    });
  }
}

// Register the custom shader material
extend({ RippleShaderMaterial });

// Water floor with ripple effect
function WaterFloor({ playerPosition, dreams }: { 
  playerPosition: { x: number, z: number },
  dreams: DreamEntry[]
}) {
  const materialRef = useRef<RippleShaderMaterial>(null);
  const { viewport } = useThree();
  const dreamPositionsRef = useRef<THREE.Vector2[]>(
    Array(20).fill(0).map(() => new THREE.Vector2(0, 0))
  );
  const prevPositionRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const trailPositionsRef = useRef<THREE.Vector2[]>(
    Array(8).fill(0).map(() => new THREE.Vector2(0, 0))
  ); // 8 trail positions
  const trailTimesRef = useRef<number[]>(Array(8).fill(0)); // 8 trail times
  const lastUpdateTimeRef = useRef<number>(0);
  const movementFactorRef = useRef<number>(0);
  
  // Initialize dream positions
  useEffect(() => {
    if (!materialRef.current) return;
    
    try {
      // Create array of Vector2 for dream positions
      const worldSize = 200;
      const dreamPositions: THREE.Vector2[] = [];
      
      // Function to get dream position
      const getDreamPosition = (id: string) => {
        // Special positioning for sample dreams to ensure they're well distributed
        if (id.startsWith("sample_dream_")) {
          // Extract the number from the sample dream ID
          const sampleNumber = parseInt(id.split("_")[2])
          
          // Distribute sample dreams in a wide circle
          const sampleCount = 6 // Total number of sample dreams
          const angle = ((sampleNumber - 1) / sampleCount) * Math.PI * 2
          
          // Use different distances based on the sample number to create a spiral effect
          const baseDistance = 15
          const distanceVariation = 5
          const distance = baseDistance + (sampleNumber % 3) * distanceVariation
          
          return {
            x: Math.cos(angle) * distance,
            z: Math.sin(angle) * distance
          }
        }
        
        // For non-sample dreams, use a hash-based approach for random but consistent positioning
        let hash = 0
        for (let i = 0; i < id.length; i++) {
          hash = ((hash << 5) - hash) + id.charCodeAt(i)
          hash |= 0 // Convert to 32bit integer
        }
        
        // Use the hash to generate a position within a radius
        // Wider radius for better distribution
        const radius = 35
        const angle = (Math.abs(hash) % 360) * (Math.PI / 180)
        
        // More variation in distance
        const minDistance = 10
        const maxDistance = 30
        const distance = minDistance + (Math.abs(hash) % (maxDistance - minDistance))
        
        // Add some slight variation to prevent dreams from aligning too perfectly
        const xOffset = (hash % 5) * 0.5
        const zOffset = ((hash >> 3) % 5) * 0.5
        
        return {
          x: Math.cos(angle) * distance + xOffset,
          z: Math.sin(angle) * distance + zOffset
        }
      };
      
      // Calculate normalized positions for all dreams
      if (Array.isArray(dreams)) {
        dreams.forEach((dream, index) => {
          if (index >= 20) return;
          
          const pos = getDreamPosition(dream.id);
          const normalizedX = (pos.x + worldSize/2) / worldSize;
          const normalizedZ = 1.0 - (pos.z + worldSize/2) / worldSize;
          
          dreamPositions.push(new THREE.Vector2(normalizedX, normalizedZ));
        });
      }
      
      // Ensure we always have exactly 20 positions
      while (dreamPositions.length < 20) {
        dreamPositions.push(new THREE.Vector2(0, 0));
      }
      
      // Update ref and shader uniform
      dreamPositionsRef.current = dreamPositions;
      
      if (materialRef.current && materialRef.current.uniforms && 
          materialRef.current.uniforms.dreamPoints) {
        materialRef.current.uniforms.dreamPoints.value = dreamPositions;
      }
    } catch (error) {
      console.error("Error initializing dream positions:", error);
      // Ensure we have a fallback
      const fallbackPositions = Array(20).fill(0).map(() => new THREE.Vector2(0, 0));
      dreamPositionsRef.current = fallbackPositions;
      
      if (materialRef.current && materialRef.current.uniforms && 
          materialRef.current.uniforms.dreamPoints) {
        materialRef.current.uniforms.dreamPoints.value = fallbackPositions;
      }
    }
  }, [dreams]);
  
  // Update shader uniforms
  useFrame((state) => {
    if (!materialRef.current || !materialRef.current.uniforms) return;
    
    try {
      const currentTime = state.clock.elapsedTime;
      materialRef.current.uniforms.time.value = currentTime;
      
      const worldSize = 200;
      const normalizedX = (playerPosition.x + worldSize/2) / worldSize;
      const normalizedZ = 1.0 - (playerPosition.z + worldSize/2) / worldSize;
      const currentPos = new THREE.Vector2(normalizedX, normalizedZ);
      
      // Check if player is moving
      const distMoved = currentPos.distanceTo(prevPositionRef.current);
      const movementThreshold = 0.0005; // Adjust this threshold as needed
      
      // Smooth movement factor transition
      if (distMoved > movementThreshold) {
        // Player is moving - increase movement factor
        movementFactorRef.current = Math.min(1.0, movementFactorRef.current + 0.2);
        
        // Update trail positions only if enough time has passed
        if (currentTime - lastUpdateTimeRef.current > 0.08) { // Update trail more frequently
          // Shift trail positions
          for (let i = trailPositionsRef.current.length - 1; i > 0; i--) {
            if (trailPositionsRef.current[i] && trailPositionsRef.current[i-1]) {
              trailPositionsRef.current[i].copy(trailPositionsRef.current[i-1]);
              trailTimesRef.current[i] = trailTimesRef.current[i-1];
            }
          }
          
          // Add current position to trail
          if (trailPositionsRef.current[0] && prevPositionRef.current) {
            trailPositionsRef.current[0].copy(prevPositionRef.current);
            trailTimesRef.current[0] = currentTime;
          }
          
          // Update the uniforms with a safe copy of the trail positions
          if (materialRef.current.uniforms.trailPositions) {
            // Ensure all positions are valid Vector2 objects
            const safeTrailPositions = trailPositionsRef.current.map(pos => 
              pos instanceof THREE.Vector2 ? pos : new THREE.Vector2(0, 0)
            );
            materialRef.current.uniforms.trailPositions.value = safeTrailPositions;
          }
          if (materialRef.current.uniforms.trailTimes) {
            materialRef.current.uniforms.trailTimes.value = [...trailTimesRef.current];
          }
          
          lastUpdateTimeRef.current = currentTime;
        }
      } else {
        // Player is not moving - decrease movement factor
        movementFactorRef.current = Math.max(0.0, movementFactorRef.current - 0.05);
      }
      
      // Update movement factor uniform
      if (materialRef.current.uniforms.movementFactor) {
        materialRef.current.uniforms.movementFactor.value = movementFactorRef.current;
      }
      
      // Update previous position
      prevPositionRef.current.copy(materialRef.current.uniforms.playerPos.value);
      
      // Update current position
      if (materialRef.current.uniforms.playerPos) {
        materialRef.current.uniforms.playerPos.value.set(normalizedX, normalizedZ);
      }
      if (materialRef.current.uniforms.resolution) {
        materialRef.current.uniforms.resolution.value.set(viewport.width, viewport.height);
      }
    } catch (error) {
      console.error("Error in WaterFloor useFrame:", error);
      // Continue rendering even if there's an error
    }
  });
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[200, 200, 100, 100]} />
      {/* @ts-ignore */}
      <rippleShaderMaterial ref={materialRef} />
    </mesh>
  );
}

// Loading UI component
function LoadingUI() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      <div className="relative w-24 h-24 mb-8">
        {/* Animated boat */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full animate-pulse"></div>
        </div>
        
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 right-0 h-4">
          <div className="w-full h-1 bg-white/30 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
          <div className="w-full h-1 mt-1 bg-white/20 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-2">Initializing Dream Explorer</h2>
      <p className="text-zinc-400 text-sm mb-4">Preparing your dream voyage...</p>
      
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading dream space</span>
      </div>
    </div>
  )
}

// Lazy loaded 3D scene to improve initial loading
const DreamScene = ({ dreams, explorerPosition, onPositionChange, touchControls, setTouchControls }: {
  dreams: DreamEntry[],
  explorerPosition: { x: number, z: number },
  onPositionChange: (position: { x: number, z: number }) => void,
  touchControls: { active: boolean, x: number, y: number },
  setTouchControls: (controls: { active: boolean, x: number, y: number }) => void
}) => {
  // Detect if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    
    // Update on resize (for devices that can switch between desktop/mobile modes)
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Safely render the scene with error boundaries
  return (
    <>
      <ErrorBoundary fallback={<div className="fixed inset-0 flex items-center justify-center bg-black text-white">
        <div className="text-center p-4">
          <h2 className="text-xl font-bold mb-2">Rendering Error</h2>
          <p>There was an error rendering the 3D scene. Please try refreshing the page.</p>
        </div>
      </div>}>
        <Canvas shadows camera={{ position: [0, 8, 12], fov: 60, near: 0.1, far: 1000 }}>
          <Suspense fallback={null}>
            <Environment />
            <WaterFloor playerPosition={explorerPosition} dreams={dreams} />
            <Grid />
            <Explorer onPositionChange={onPositionChange} touchControls={touchControls} />
            <DreamPoints dreams={dreams} boatPosition={explorerPosition} />
            <AdvertisementSpheres />
            
            {/* Only render post-processing effects on desktop */}
            {!isMobile && (
              <ErrorBoundary fallback={null}>
                <Suspense fallback={null}>
                  <EffectComposer>
                    <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={1} />
                    <Vignette eskil={false} offset={0.1} darkness={0.7} />
                  </EffectComposer>
                </Suspense>
              </ErrorBoundary>
            )}
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      
      {/* Mobile joystick control */}
      <Joystick setTouchControls={setTouchControls} />
    </>
  )
}

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode, fallback: React.ReactNode}> {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: any, info: any) {
    console.error("Error in 3D scene:", error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Grid for orientation
function Grid() {
  return (
    <group>
      {/* Main grid */}
      <gridHelper args={[100, 100, "#ffffff", "#333333"]} position={[0, -0.05, 0]} />
      
      {/* Cardinal direction markers */}
      <group position={[0, 0.1, 0]}>
        <Text position={[0, 0, -45]} rotation={[-Math.PI/2, 0, 0]} fontSize={5} color="white">
          N
        </Text>
        <Text position={[45, 0, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={5} color="white">
          E
        </Text>
        <Text position={[0, 0, 45]} rotation={[-Math.PI/2, 0, 0]} fontSize={5} color="white">
          S
        </Text>
        <Text position={[-45, 0, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={5} color="white">
          W
        </Text>
      </group>
      
      {/* Distance rings */}
      {[10, 20, 30, 40].map((radius) => (
        <mesh key={radius} position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[radius - 0.1, radius, 64]} />
          <meshBasicMaterial color="#333333" side={THREE.DoubleSide} transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// Explorer sphere with direct WASD movement and angled camera
function Explorer({ onPositionChange, touchControls }: { 
  onPositionChange: (position: { x: number, z: number }) => void,
  touchControls: { active: boolean, x: number, y: number }
}) {
  const { camera } = useThree()
  const sphereRef = useRef<THREE.Mesh>(null)
  
  // Use refs instead of state for frequently changing values
  const positionRef = useRef<{ x: number, z: number }>({ x: 0, z: 0 })
  const pulseIntensityRef = useRef<number>(1)
  
  // Keep state for values that don't change every frame
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Refs for smooth camera movement
  const targetPositionRef = useRef<{ x: number, z: number }>({ x: 0, z: 0 })
  const cameraTargetRef = useRef<{ x: number, z: number }>({ x: 0, z: 12 })
  const isInitializedRef = useRef<boolean>(false)
  
  // Movement parameters
  const moveSpeed = 0.15
  const smoothingFactor = 0.1
  const cameraSmoothingFactor = 0.05
  
  // Initialize audio
  useEffect(() => {
    // Initialize ambient sound
    const ambientSound = new Audio('/sounds/boat.mp3')
    ambientSound.loop = true
    ambientSound.volume = 0.2
    audioRef.current = ambientSound
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])
  
  // Update audio based on movement
  useEffect(() => {
    if (!audioRef.current) return
    
    // Start playing if any movement key is pressed or touch controls are active
    const isMoving = keys.w || keys.a || keys.s || keys.d || touchControls.active
    
    // Update audio immediately
    updateAudio()
    
    // Set up animation frame for smooth updates
    let frameId: number
    const animate = () => {
      updateAudio()
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [keys, touchControls])
  
  // Set up camera at an angle similar to the reference image - run immediately
  useEffect(() => {
    // Position camera at an angle behind and above the explorer
    camera.position.set(0, 8, 12)
    camera.lookAt(0, 0, 0)
    
    // Initialize camera target to match initial position
    cameraTargetRef.current = { x: 0, z: 12 }
    isInitializedRef.current = true
    
    // Force an immediate update to prevent the initial top-down view
    return () => {
      isInitializedRef.current = false
    }
  }, [camera])
  
  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') setKeys(prev => ({ ...prev, w: true }))
      if (e.key.toLowerCase() === 'a') setKeys(prev => ({ ...prev, a: true }))
      if (e.key.toLowerCase() === 's') setKeys(prev => ({ ...prev, s: true }))
      if (e.key.toLowerCase() === 'd') setKeys(prev => ({ ...prev, d: true }))
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') setKeys(prev => ({ ...prev, w: false }))
      if (e.key.toLowerCase() === 'a') setKeys(prev => ({ ...prev, a: false }))
      if (e.key.toLowerCase() === 's') setKeys(prev => ({ ...prev, s: false }))
      if (e.key.toLowerCase() === 'd') setKeys(prev => ({ ...prev, d: false }))
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  // Update audio volume and playback based on movement
  const updateAudio = () => {
    if (!audioRef.current) return
    
    const isMoving = keys.w || keys.a || keys.s || keys.d || touchControls.active
    
    if (isMoving) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e))
      }
      // Gradually increase volume when moving
      audioRef.current.volume = Math.min(0.2, audioRef.current.volume + 0.01)
    } else {
      // Gradually decrease volume when not moving
      audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.01)
      if (audioRef.current.volume <= 0.01) {
        audioRef.current.pause()
      }
    }
  }
  
  // Update position based on controls
  useFrame((state, delta) => {
    if (!sphereRef.current) return
    
    // Ensure camera is in the correct position on first frame
    if (!isInitializedRef.current) {
      camera.position.set(0, 8, 12)
      camera.lookAt(0, 0, 0)
      isInitializedRef.current = true
    }
    
    // Calculate target position based on WASD keys (direct movement)
    let targetX = targetPositionRef.current.x
    let targetZ = targetPositionRef.current.z
    
    // Apply input to target position
    if (keys.w) targetZ -= moveSpeed // Forward (north)
    if (keys.s) targetZ += moveSpeed // Backward (south)
    if (keys.a) targetX -= moveSpeed // Left (west)
    if (keys.d) targetX += moveSpeed // Right (east)
    
    // Handle touch joystick input for mobile
    if (touchControls.active) {
      targetX += touchControls.x * moveSpeed
      targetZ += touchControls.y * moveSpeed // Negative sign to fix inverted Y-axis
    }
    
    // Limit movement area
    const boundaryLimit = 40
    targetX = Math.max(Math.min(targetX, boundaryLimit), -boundaryLimit)
    targetZ = Math.max(Math.min(targetZ, boundaryLimit), -boundaryLimit)
    
    // Update target position
    targetPositionRef.current = { x: targetX, z: targetZ }
    
    // Smoothly interpolate current position towards target position (exponential smoothing)
    const newX = positionRef.current.x + (targetX - positionRef.current.x) * smoothingFactor
    const newZ = positionRef.current.z + (targetZ - positionRef.current.z) * smoothingFactor
    
    // Only update if position changed significantly
    if (Math.abs(newX - positionRef.current.x) > 0.001 || Math.abs(newZ - positionRef.current.z) > 0.001) {
      // Update the ref instead of state
      positionRef.current = { x: newX, z: newZ }
      
      // Only call onPositionChange when position changes significantly
      onPositionChange({ x: newX, z: newZ })
      
      // Set camera target position
      cameraTargetRef.current = { 
        x: newX, 
        z: newZ + 12 // Keep camera behind the explorer
      }
    }
    
    // Smoothly move camera towards target position (with even more smoothing)
    camera.position.x += (cameraTargetRef.current.x - camera.position.x) * cameraSmoothingFactor
    camera.position.z += (cameraTargetRef.current.z - camera.position.z) * cameraSmoothingFactor
    
    // Smoothly look at the explorer's position
    const lookAtTarget = new THREE.Vector3(newX, 0, newZ)
    const currentLookAt = new THREE.Vector3()
    camera.getWorldDirection(currentLookAt)
    currentLookAt.multiplyScalar(10).add(camera.position)
    
    const smoothLookAtX = currentLookAt.x + (lookAtTarget.x - currentLookAt.x) * cameraSmoothingFactor
    const smoothLookAtY = currentLookAt.y + (lookAtTarget.y - currentLookAt.y) * cameraSmoothingFactor
    const smoothLookAtZ = currentLookAt.z + (lookAtTarget.z - currentLookAt.z) * cameraSmoothingFactor
    
    camera.lookAt(smoothLookAtX, smoothLookAtY, smoothLookAtZ)
    
    // Update sphere position
    sphereRef.current.position.x = newX
    sphereRef.current.position.z = newZ
    
    // Make the sphere bob up and down gently
    sphereRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 + 0.5
    
    // Pulsating effect for the sphere
    const newPulseIntensity = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    pulseIntensityRef.current = newPulseIntensity
    
    if (sphereRef.current.material instanceof THREE.MeshStandardMaterial) {
      sphereRef.current.material.emissiveIntensity = newPulseIntensity
    }
    
    // Update global explorer position for other components to access
    if (typeof window !== 'undefined') {
      window.explorerPosition = { x: newX, z: newZ }
    }
  })
  
  return (
    <mesh ref={sphereRef} position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial 
        color="white" 
        emissive="white" 
        emissiveIntensity={pulseIntensityRef.current}
        toneMapped={false}
      />
    </mesh>
  )
}

// Dream points scattered around the space
function DreamPoints({ dreams, boatPosition }: { dreams: DreamEntry[], boatPosition: { x: number, z: number } }) {
  const [activePoint, setActivePoint] = useState<string | null>(null)
  
  // Check if boat is near any dream point
  useEffect(() => {
    const checkProximity = () => {
      for (const dream of dreams) {
        const dreamPosition = getDreamPosition(dream.id, dreams.length)
        const distance = Math.sqrt(
          Math.pow(boatPosition.x - dreamPosition.x, 2) + 
          Math.pow(boatPosition.z - dreamPosition.z, 2)
        )
        
        if (distance < 2) {
          setActivePoint(dream.id)
          return
        }
      }
      setActivePoint(null)
    }
    
    checkProximity()
  }, [boatPosition, dreams])
  
  // Generate a consistent position for each dream based on its ID
  const getDreamPosition = (id: string, totalDreams: number) => {
    // Special positioning for sample dreams to ensure they're well distributed
    if (id.startsWith("sample_dream_")) {
      // Extract the number from the sample dream ID
      const sampleNumber = parseInt(id.split("_")[2])
      
      // Distribute sample dreams in a wide circle
      const sampleCount = 6 // Total number of sample dreams
      const angle = ((sampleNumber - 1) / sampleCount) * Math.PI * 2
      
      // Use different distances based on the sample number to create a spiral effect
      const baseDistance = 15
      const distanceVariation = 5
      const distance = baseDistance + (sampleNumber % 3) * distanceVariation
      
      return {
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance
      }
    }
    
    // For non-sample dreams, use a hash-based approach for random but consistent positioning
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }
    
    // Use the hash to generate a position within a radius
    // Wider radius for better distribution
    const radius = 35
    const angle = (Math.abs(hash) % 360) * (Math.PI / 180)
    
    // More variation in distance
    const minDistance = 10
    const maxDistance = 30
    const distance = minDistance + (Math.abs(hash) % (maxDistance - minDistance))
    
    // Add some slight variation to prevent dreams from aligning too perfectly
    const xOffset = (hash % 5) * 0.5
    const zOffset = ((hash >> 3) % 5) * 0.5
    
    return {
      x: Math.cos(angle) * distance + xOffset,
      z: Math.sin(angle) * distance + zOffset
    }
  }
  
  // Get intensity based on emotion
  const getEmotionIntensity = (emotion: string): number => {
    switch (emotion.toLowerCase()) {
      case "happy":
      case "excited":
        return 1.5
      case "scared":
      case "anxious":
        return 1.2
      case "confused":
        return 1.0
      case "peaceful":
        return 0.8
      default:
        return 1.0
    }
  }
  
  return (
    <>
      {dreams.map((dream) => {
        const position = getDreamPosition(dream.id, dreams.length)
        const isActive = activePoint === dream.id
        const intensity = getEmotionIntensity(dream.emotion)
        
        return (
          <group key={dream.id} position={[position.x, 0, position.z]}>
            {/* Dream box */}
            <mesh position={[0, 1 + Math.sin(Date.now() * 0.001 + parseInt(dream.id, 36)) * 0.2, 0]}>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshStandardMaterial 
                color="white" 
                emissive="white"
                emissiveIntensity={isActive ? intensity * 2 : intensity}
                transparent
                opacity={0.8}
              />
            </mesh>
            
            {/* Light beam */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.1, 0.5, 1, 8]} />
              <meshBasicMaterial 
                color="white" 
                transparent
                opacity={0.2}
              />
            </mesh>
            
            {/* Connection to ground */}
            <mesh>
              <boxGeometry args={[0.1, 1, 0.1]} />
              <meshBasicMaterial color="white" transparent opacity={0.3} />
            </mesh>
            
            {/* Dream info panel when active */}
            {isActive && (
              <Html position={[0, 3, 0]} center>
                <div className="bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/20 text-white w-64">
                  <h3 className="text-lg font-bold">{dream.title}</h3>
                  <p className="text-xs text-gray-300 mb-2">{new Date(dream.date).toLocaleDateString()}</p>
                  <p className="text-sm mb-2">{dream.summary.substring(0, 100)}...</p>
                  <div className="flex justify-end">
                    <button 
                      className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
                      onClick={() => window.location.href = `/dream/${dream.id}`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </>
  )
}

// Mobile joystick control
function Joystick({ setTouchControls }: { setTouchControls: (controls: { active: boolean, x: number, y: number }) => void }) {
  const [active, setActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  
  const handleStart = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return
    
    setActive(true)
    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    updatePosition(clientX, clientY, centerX, centerY)
  }
  
  const handleMove = (clientX: number, clientY: number) => {
    if (!active || !joystickRef.current) return
    
    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    updatePosition(clientX, clientY, centerX, centerY)
  }
  
  const handleEnd = () => {
    setActive(false)
    setPosition({ x: 0, y: 0 })
    setTouchControls({ active: false, x: 0, y: 0 })
  }
  
  const updatePosition = (clientX: number, clientY: number, centerX: number, centerY: number) => {
    if (!joystickRef.current) return
    
    const radius = joystickRef.current.offsetWidth / 2
    let x = (clientX - centerX) / radius
    let y = (clientY - centerY) / radius
    
    // Limit to a circle
    const distance = Math.sqrt(x * x + y * y)
    if (distance > 1) {
      x /= distance
      y /= distance
    }
    
    setPosition({ x, y })
    setTouchControls({ active: true, x, y })
  }
  
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!joystickRef.current) return
      const touch = e.touches[0]
      handleStart(touch.clientX, touch.clientY)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!active || !joystickRef.current) return
      const touch = e.touches[0]
      handleMove(touch.clientX, touch.clientY)
    }
    
    const handleTouchEnd = () => {
      handleEnd()
    }
    
    const joystick = joystickRef.current
    if (joystick) {
      joystick.addEventListener('touchstart', handleTouchStart)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)
    }
    
    return () => {
      if (joystick) {
        joystick.removeEventListener('touchstart', handleTouchStart)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [active])
  
  return (
    <div 
      ref={joystickRef}
      className="fixed bottom-24 right-8 w-32 h-32 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 touch-none md:hidden"
    >
      <div 
        ref={knobRef}
        className="absolute w-16 h-16 rounded-full bg-white/20 border border-white/40"
        style={{ 
          left: `calc(50% - 2rem + ${position.x * 32}px)`, 
          top: `calc(50% - 2rem + ${position.y * 32}px)` 
        }}
      />
    </div>
  )
}

// Scene environment - black and white with angled camera
function Environment() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} />
      <fog attach="fog" args={['#000000', 15, 50]} />
      
      {/* Dark "floor" plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </>
  )
}

// Advertisement spheres component
function AdvertisementSpheres() {
  // Define ad sphere data with IDs, positions, and status
  const adSpheres = useMemo(() => {
    const spherePositions: Array<{
      id: string;
      position: { x: number; y: number; z: number };
      status: 'available' | 'pending' | 'purchased';
    }> = [];
    
    // 1. Outer circle (6 spheres) - spread wider
    const outerRadius = 35
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      spherePositions.push({
        id: `Circle-${i+1}`,
        position: {
          x: Math.cos(angle) * outerRadius,
          y: 1 + (i % 3) * 0.3, // Vary height slightly
          z: Math.sin(angle) * outerRadius
        },
        status: 'available' as const
      })
    }
    
    // 2. Four spheres at wider corners
    const cornerPositions = [
      { id: 'Corner-NE', position: { x: 38, y: 1, z: 38 }, status: 'available' as const },
      { id: 'Corner-NW', position: { x: -38, y: 1, z: 38 }, status: 'available' as const },
      { id: 'Corner-SE', position: { x: 38, y: 1, z: -38 }, status: 'available' as const },
      { id: 'Corner-SW', position: { x: -38, y: 1, z: -38 }, status: 'available' as const }
    ]
    
    spherePositions.push(...cornerPositions)
    
    return spherePositions
  }, [])
  
  return (
    <group>
      {adSpheres.map((sphere, index) => (
        <FloatingAdSphere 
          key={sphere.id} 
          position={sphere.position} 
          index={index}
          id={sphere.id}
          status={sphere.status}
        />
      ))}
    </group>
  )
}

// Individual floating advertisement sphere with animation
function FloatingAdSphere({ position, index, id, status }: { 
  position: { x: number, y: number, z: number }, 
  index: number,
  id: string,
  status: 'available' | 'pending' | 'purchased'
}) {
  const sphereRef = useRef<THREE.Mesh>(null)
  const textGroupRef = useRef<THREE.Group>(null)
  const [isPlayerNear, setIsPlayerNear] = useState(false)
  
  // Use different phase for each sphere to create varied movement
  const phaseOffset = index * 0.5
  
  // Set color based on status
  const getSphereColor = () => {
    switch(status) {
      case 'purchased': return "lightblue"
      case 'pending': return "lightyellow"
      default: return "white"
    }
  }
  
  // Check if player is near this advertisement sphere
  useFrame(({ clock }) => {
    if (!sphereRef.current || !textGroupRef.current) return
    
    const time = clock.getElapsedTime()
    
    // Get the current player position from the Explorer component
    // This is passed to the DreamScene component as explorerPosition
    // We need to access it from the global state
    const playerPosition = window.explorerPosition || { x: 0, z: 0 }
    
    // Calculate distance to player (ignoring Y axis)
    const distanceToPlayer = Math.sqrt(
      Math.pow(playerPosition.x - position.x, 2) + 
      Math.pow(playerPosition.z - position.z, 2)
    )
    
    // Check if player is near (increased to 5 units for better detection)
    const playerIsNear = distanceToPlayer < 5
    if (playerIsNear !== isPlayerNear) {
      setIsPlayerNear(playerIsNear)
    }
    
    // Gentle floating motion - different for each sphere but lower height
    const floatY = Math.sin(time * 0.5 + phaseOffset) * 0.3
    sphereRef.current.position.y = floatY
    
    // Position text slightly above sphere
    textGroupRef.current.position.y = 1.5 + floatY
    
    // Continuous rotation for the text around the sphere
    textGroupRef.current.rotation.y = time * 0.5 + phaseOffset
    
    // Pulsating glow effect - enhanced when player is near
    if (sphereRef.current.material instanceof THREE.MeshStandardMaterial) {
      const baseIntensity = isPlayerNear ? 1.0 : 0.5
      const pulseIntensity = baseIntensity + Math.sin(time * 0.8 + phaseOffset) * (isPlayerNear ? 0.4 : 0.2)
      sphereRef.current.material.emissiveIntensity = pulseIntensity
      
      // Also adjust opacity
      sphereRef.current.material.opacity = isPlayerNear ? 0.9 : 0.8
    }
  })
  
  // Get display text based on status
  const getDisplayText = () => {
    switch(status) {
      case 'purchased': return "ad space sold"
      case 'pending': return "ad space pending"
      default: return "advertise here"
    }
  }
  
  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Floating sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={getSphereColor()} 
          emissive={getSphereColor()}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Advertisement text using Text component instead of HTML */}
      <group ref={textGroupRef} position={[0, 1.5, 0]}>
        <Text
          color="white"
          fontSize={0.5}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
          renderOrder={1}
        >
          {getDisplayText()}
        </Text>
      </group>
      
      {/* Interactive message when player is near */}
      {isPlayerNear && (
        <Html position={[0, 3, 0]} center wrapperClass="html-portal">
          <div className="bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/20 text-white w-72 text-center">
            <p className="text-sm font-bold mb-1">Premium Ad Space #{id}</p>
            <p className="text-xs mb-2">Buy this ad space for $1K USD annually</p>
            
            <div className="flex flex-col gap-2">
              {/* Direct Buy Now button */}
              <a 
                href="https://buy.stripe.com/5kA29I0C06tca0EdQQ"
                className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy Now
              </a>
              
              {/* Web email link */}
              <a 
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=ikramandhakim@gmail.com&su=Purchase Dream Explorer Ad Space ${id}&body=I'm interested in purchasing ad space ${id} in the Dream Explorer.`}
                className="inline-block bg-white text-black text-xs font-medium px-3 py-1.5 rounded hover:bg-white/90 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact via Email
              </a>
            </div>
            
            {/* Payment follow-up instructions */}
            <div className="mt-3 text-xs text-gray-300 border-t border-gray-700 pt-2">
              <p className="mb-1">After payment, please email the receipt and your preferred sphere id (e.g: #{id}) to ikramandhakim@gmail.com to finalize the process.</p>
              <p className="mb-1">Ad space setup typically takes 24-48 hours.</p>
              <p>
                Questions? Connect on{" "}
                <a 
                  href="https://x.com/Kaberikram" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  X @Kaberikram
                </a>
              </p>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Preload THREE.js resources
const preloadThreeResources = () => {
  // Only run on client side
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  try {
    // Create a hidden canvas to initialize THREE.js
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.width = '1px';
    canvas.style.height = '1px';
    canvas.style.opacity = '0';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    
    // Initialize a minimal THREE scene to trigger resource loading
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setSize(1, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    
    // Add a simple mesh to force shader compilation
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    // Render once to initialize
    renderer.render(scene, camera);
    
    // Clean up after a short delay
    setTimeout(() => {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    }, 1000);
  } catch (error) {
    console.error("Error in preloadThreeResources:", error);
    // Silently fail - this is just an optimization
  }
};

// Main scene component that handles loading
function DreamExplorer() {
  const [dreams, setDreams] = useState<DreamEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSceneReady, setIsSceneReady] = useState(false)
  const [explorerPosition, setExplorerPosition] = useState({ x: 0, z: 0 })
  const [touchControls, setTouchControls] = useState({ active: false, x: 0, y: 0 })
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(false)
  const hasInitializedRef = useRef(false);
  
  // Set initial instructions state - always expanded by default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Always start expanded
      setInstructionsCollapsed(false);
      
      // No need to update on resize since we always start expanded
    }
  }, []);
  
  // Preload THREE.js resources on component mount - safely
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    
    // Ensure we only run this once
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Wrap in try/catch to prevent any errors from breaking the app
      try {
        preloadThreeResources();
      } catch (error) {
        console.error("Error during preload:", error);
        // Continue loading the app even if preloading fails
      }
    }
  }, []);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    // Load dreams from localStorage
    const loadData = async () => {
      try {
        let savedDreams = [];
        try {
          savedDreams = JSON.parse(localStorage.getItem("dreams") || "[]");
        } catch (e) {
          console.error("Error parsing dreams from localStorage:", e);
          savedDreams = [];
        }
        
        setDreams(savedDreams);
        
        // Simulate loading time for 3D resources
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mark scene as ready to render
        setIsSceneReady(true);
        
        // Keep loading UI visible for a moment after scene is ready for smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Finally hide loading UI
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading dreams:", error);
        setIsLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      // Clean up any resources if needed
    };
  }, []);
  
  // Handle explorer position updates
  const handlePositionChange = (position: { x: number, z: number }) => {
    // Only update state if position has changed significantly
    if (
      !explorerPosition || 
      Math.abs(position.x - explorerPosition.x) > 0.001 || 
      Math.abs(position.z - explorerPosition.z) > 0.001
    ) {
      setExplorerPosition(position)
    }
    
    // The global window.explorerPosition is now set directly in the Explorer component
  }
  
  // Toggle instructions panel
  const toggleInstructions = () => {
    setInstructionsCollapsed(!instructionsCollapsed);
  }
  
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Loading UI - always shown initially */}
      {isLoading && <LoadingUI />}
      
      {/* Only show header on mobile */}
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 md:hidden">
        <h1 className="text-lg font-semibold">Dream Voyage</h1>
      </header>
      
      <main className="w-full h-[calc(100vh-56px-60px)] md:h-screen md:absolute md:inset-0 md:left-64 overflow-hidden">
        {/* Only render 3D scene when ready */}
        {isSceneReady && (
          <DreamScene 
            dreams={dreams} 
            explorerPosition={explorerPosition} 
            onPositionChange={handlePositionChange}
            touchControls={touchControls}
            setTouchControls={setTouchControls}
          />
        )}
        
        {/* Instructions overlay - now at the top and collapsible with icon */}
        <div 
          className={`absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-auto md:w-80 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 text-white text-sm transition-all duration-300 z-50 shadow-lg ${instructionsCollapsed ? 'p-0 h-12' : 'p-4'}`}
        >
          <div 
            className={`flex justify-between items-center w-full h-full ${instructionsCollapsed ? 'px-4 cursor-pointer' : ''}`}
            onClick={instructionsCollapsed ? toggleInstructions : undefined}
          >
            <div className="flex items-center">
              <h2 className="font-bold text-base">Dream Voyage</h2>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleInstructions();
              }} 
              className="text-white hover:text-white/70 flex items-center justify-center w-8 h-8 bg-zinc-800/80 rounded-full"
              aria-label={instructionsCollapsed ? "Expand instructions" : "Collapse instructions"}
            >
              {instructionsCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
          
          <div className={`${instructionsCollapsed ? 'hidden' : 'block mt-2'}`}>
            <p>Navigate your dream explorer:</p>
            <ul className="list-disc list-inside mt-1 text-xs text-gray-300">
              <li className="md:block hidden">Use WASD keys for direct movement</li>
              <li className="md:hidden block">Use the joystick to move your explorer</li>
              <li>Approach glowing boxes to explore dreams</li>
            </ul>
          </div>
        </div>
      </main>
      
      {/* Bottom navigation for mobile */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}

// Page component - simplified to just render the DreamExplorer
export default function ExplorePage() {
  // Add and remove the explore-page class to the body element
  useEffect(() => {
    // Only run on client side
    if (typeof document === 'undefined') return;
    
    // Add the explore-page class to html and body
    document.documentElement.classList.add('explore-page');
    document.body.classList.add('explore-page');
    
    // Clean up when component unmounts
    return () => {
      document.documentElement.classList.remove('explore-page');
      document.body.classList.remove('explore-page');
    };
  }, []);
  
  return <DreamExplorer />
}

// Add TypeScript declaration for the global window object
declare global {
  interface Window {
    explorerPosition?: { x: number, z: number }
  }
} 