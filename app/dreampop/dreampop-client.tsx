"use client"

import { useEffect, useState, useRef, Suspense, useMemo, useCallback } from "react"
import React from 'react'
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber"
import { Text, Html, Plane, OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import * as THREE from "three"
import { Loader2, ChevronUp, ChevronDown } from "lucide-react"
import { createRoot } from 'react-dom/client'
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js'

// Windows logo colors as hex strings (Source of Truth)
const WINDOWS_COLOR_HEX = [
  "#f25022", // Red (0)
  "#ffb900", // Yellow (1)
  "#7fba00", // Green (2)
  "#00a4ef", // Blue (3)
];

// Windows logo colors as THREE.Color objects (Derived)
const WINDOWS_COLORS = WINDOWS_COLOR_HEX.map(hex => new THREE.Color(hex));

// Helper function to get a random Windows logo color object
function getRandomWindowsColor() {
  // Now uses the derived WINDOWS_COLORS array, indices match HEX array
  return WINDOWS_COLORS[Math.floor(Math.random() * WINDOWS_COLORS.length)];
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
        baseColor: { value: new THREE.Color(0x111111) },
        wrongHitActive: { value: 0.0 }, // New uniform for wrong hit indicator (0-1)
        wrongHitTime: { value: 0.0 }, // Time when wrong hit occurred
        wrongHitColor: { value: new THREE.Color(1.0, 0.2, 0.2) }, // Red color for wrong hit
        matchHitActive: { value: 0.0 }, // New uniform for match hit indicator (0-1)
        matchHitTime: { value: 0.0 }, // Time when match hit occurred
        matchHitColor: { value: new THREE.Color(1.0, 1.0, 1.0) } // Default color, will be set dynamically
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
        uniform float wrongHitActive; // New uniform for wrong hit indicator
        uniform float wrongHitTime; // Time when wrong hit occurred
        uniform vec3 wrongHitColor; // Color for wrong hit
        uniform float matchHitActive; // New uniform for match hit indicator
        uniform float matchHitTime; // Time when match hit occurred
        uniform vec3 matchHitColor; // Color for match hit
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
          
          // Create grid
          float gridPattern = grid(vUv, 10.0) * 0.3;
          
          // Combine all effects
          vec3 color = mix(baseColor, gridColor, gridPattern);
          
          // Apply player ripples with the appropriate color
          if (playerRipple > 0.0) {
            // Default ripple color
            vec3 currentRippleColor = rippleColor;
            
            // Calculate fade factors based on time since hit (0.5s duration)
            float timeSinceMatchHit = time - matchHitTime;
            float matchHitFactor = max(0.0, 1.0 - timeSinceMatchHit / 0.5);
            
            float timeSinceWrongHit = time - wrongHitTime;
            float wrongHitFactor = max(0.0, 1.0 - timeSinceWrongHit / 0.5);
            
            // Prioritize the latest hit color - no mixing
            if (matchHitActive > 0.0 && matchHitFactor > 0.0) {
              // If match hit is active and within its fade duration
              currentRippleColor = matchHitColor;
            } else if (wrongHitActive > 0.0 && wrongHitFactor > 0.0) {
              // Else if wrong hit is active and within its fade duration
              currentRippleColor = wrongHitColor;
            } 
            // Else: currentRippleColor remains the default rippleColor
            
            // Mix the final color with the determined ripple color
            color = mix(color, currentRippleColor, playerRipple);
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
function WaterFloor({ playerPosition, wrongHitStatus, matchHitStatus }: { 
  playerPosition: { x: number, z: number },
  wrongHitStatus?: { active: boolean, time: number }, // Wrong hit status
  matchHitStatus?: { active: boolean, time: number, color: THREE.Color } // Match hit status with color
}) {
  const materialRef = useRef<RippleShaderMaterial>(null);
  const { viewport } = useThree();
  const prevPositionRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const trailPositionsRef = useRef<THREE.Vector2[]>(Array(8).fill(0).map(() => new THREE.Vector2(0, 0))); // 8 trail positions
  const trailTimesRef = useRef<number[]>(Array(8).fill(0)); // 8 trail times
  const lastUpdateTimeRef = useRef<number>(0);
  const movementFactorRef = useRef<number>(0);

  // Update shader uniforms
  useFrame((state) => {
    if (!materialRef.current || !materialRef.current.uniforms) return;
    
    try {
      const currentTime = state.clock.elapsedTime;
      materialRef.current.uniforms.time.value = currentTime;
      
      // Update wrong hit status if provided
      if (wrongHitStatus && materialRef.current.uniforms.wrongHitActive && materialRef.current.uniforms.wrongHitTime) {
        materialRef.current.uniforms.wrongHitActive.value = wrongHitStatus.active ? 1.0 : 0.0;
        if (wrongHitStatus.active) {
          materialRef.current.uniforms.wrongHitTime.value = wrongHitStatus.time;
        }
      }
      
      // Update match hit status if provided
      if (matchHitStatus && materialRef.current.uniforms.matchHitActive && 
          materialRef.current.uniforms.matchHitTime && materialRef.current.uniforms.matchHitColor) {
        materialRef.current.uniforms.matchHitActive.value = matchHitStatus.active ? 1.0 : 0.0;
        if (matchHitStatus.active) {
          materialRef.current.uniforms.matchHitTime.value = matchHitStatus.time;
          
          // Get the color from matchHitStatus
          const color = matchHitStatus.color;
          
          // Ensure color is properly set (avoid black by checking color values)
          if (color.r === 0 && color.g === 0 && color.b === 0) {
            // If color is black, use a default bright color
            materialRef.current.uniforms.matchHitColor.value.set(1, 1, 1);
          } else {
            // Use the actual color with full brightness
            // Make a fresh copy of the color to avoid reference issues
            materialRef.current.uniforms.matchHitColor.value.setRGB(
              color.r,
              color.g,
              color.b
            );
          }
        }
      }
      
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

// Post-processing effects component
function PostProcessingEffects({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    // For mobile, use no post-processing effects for maximum performance
    return null;
  } else {
    // For desktop, use both Bloom and Vignette
    return (
      <EffectComposer>
        <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} intensity={1} />
        <Vignette eskil={false} offset={0.1} darkness={0.7} />
      </EffectComposer>
    );
  }
}

// Add game state types at the top of the file after imports
type GameState = "PRE_GAME" | "PLAYING" | "POST_GAME";

// Add type for leaderboard entry
interface LeaderboardEntry {
  id?: number // Optional ID from Supabase
  name: string
  score: number
  created_at?: string // Optional timestamp
}

// Create Supabase client instance (replace with your actual URL and anon key)
// IMPORTANT: Store these securely, ideally in environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Basic check if variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Leaderboard will not function.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add dummy leaderboard data
const DUMMY_LEADERBOARD: LeaderboardEntry[] = [
  { name: "DreamMaster", score: 42, created_at: "2023-11-15" },
  { name: "ColorWizard", score: 38, created_at: "2023-11-14" },
  { name: "StarExplorer", score: 35, created_at: "2023-11-13" },
  { name: "NeonDreamer", score: 29, created_at: "2023-11-12" },
  { name: "SkyWalker", score: 25, created_at: "2023-11-11" },
];

// Dream scene
function DreamScene({ explorerPosition, onPositionChange, touchControls, setTouchControls, gameActive, onScoreUpdate, initialScore, timeLeft, totalTime }: { 
  explorerPosition: { x: number, z: number },
  onPositionChange: (position: { x: number, z: number }) => void,
  touchControls: { active: boolean, x: number, y: number },
  setTouchControls: (controls: { active: boolean, x: number, y: number }) => void,
  gameActive: boolean,
  onScoreUpdate: (score: number) => void,
  initialScore: number,
  timeLeft: number,
  totalTime: number
}) {
  const [spherePositions, setSpherePositions] = useState(() => 
    Array.from({ length: 10 }, () => ({ 
      x: Math.random() * 50 - 25, 
      y: 0.7, 
      z: Math.random() * 50 - 25,
      color: getRandomWindowsColor() // Add random color to each sphere
    }))
  );
  const [playerColorIndex, setPlayerColorIndex] = useState(0); // Track player color index
  const [score, setScore] = useState(initialScore);
  const scoreAudioRef = useRef<any>(null);
  const wrongAudioRef = useRef<any>(null); // Add reference for wrong sound
  const comboCountRef = useRef<number>(0);
  const lastHitTimeRef = useRef<number>(0);
  const comboResetTimerRef = useRef<number | null>(null);
  
  // Add state to track if device is mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // Add state to track recent collisions
  const [recentCollisions, setRecentCollisions] = useState<Set<number>>(new Set());
  
  // Add state for wrong hit visual effect
  const [wrongHitStatus, setWrongHitStatus] = useState({ active: false, time: 0 });
  
  // Add state for match hit visual effect
  const [matchHitStatus, setMatchHitStatus] = useState<{ active: boolean, time: number, color: THREE.Color }>({ 
    active: false, 
    time: 0, 
    color: new THREE.Color(1, 1, 1) 
  });

  // Reset game when game becomes inactive
  useEffect(() => {
    if (!gameActive && initialScore === 0) {
      // Only reset spheres and player color when starting a new game, not when ending
      setSpherePositions(
        Array.from({ length: 10 }, () => ({ 
          x: Math.random() * 50 - 25, 
          y: 0.7, 
          z: Math.random() * 50 - 25,
          color: getRandomWindowsColor()
        }))
      );
      // Reset player color
      setPlayerColorIndex(0);
      // Reset score to initial value
      setScore(initialScore);
    }
  }, [gameActive, initialScore]);

  // Report score updates to parent component
  useEffect(() => {
    onScoreUpdate(score);
  }, [score, onScoreUpdate]);

  // Detect if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    
    if (typeof window !== 'undefined') {
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkIfMobile);
      }
    };
  }, []);
  
  // Handle color switching with spacebar or mouse click
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameActive) return; // Only allow color change during gameplay
      
      if (e.code === 'Space') {
        e.preventDefault();
        // Only change color, don't trigger any audio
        setPlayerColorIndex((prev) => (prev + 1) % WINDOWS_COLORS.length);
      }
    };

    const handleMouseClick = () => {
      if (!gameActive) return; // Only allow color change during gameplay
      
      // Only change color, don't trigger any audio
      setPlayerColorIndex((prev) => (prev + 1) % WINDOWS_COLORS.length);
    };
    
    // Add a touch handler specifically for changing colors
    const handleTouchEnd = (e: TouchEvent) => {
      if (!gameActive) return; // Only allow color change during gameplay
      
      // Get the touch target
      const target = e.target as HTMLElement;
      
      // Skip if the touch is on the joystick
      if (target.closest('.joystick-container')) {
        return;
      }
      
      // If this is a quick tap (not dragging), change color
      // This prevents color changes when using the joystick
      if (e.changedTouches.length > 0) {
        setPlayerColorIndex((prev) => (prev + 1) % WINDOWS_COLORS.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleMouseClick);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleMouseClick);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameActive]);

  // Initialize both sound effects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically import Tone.js to avoid SSR issues
      import('tone').then(({ Synth, PolySynth, Reverb, Chorus, FeedbackDelay, Filter, NoiseSynth }) => {
        // Create score sound setup (existing code)
        const reverb = new Reverb({
          decay: 2,
          wet: 0.4
        }).toDestination();
        
        const chorus = new Chorus({
          frequency: 1.5,
          delayTime: 2.5,
          depth: 0.4,
          wet: 0.2
        }).connect(reverb);
        
        const filter = new Filter({
          type: "lowpass",
          frequency: 3000,
          rolloff: -12,
          Q: 1
        }).connect(chorus);
        
        const delay = new FeedbackDelay({
          delayTime: 0.2,
          feedback: 0.15,
          wet: 0.15
        }).connect(filter);
        
        const synth = new PolySynth(Synth, {
          oscillator: {
            type: "sine"
          },
          envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.2,
            release: 1.5
          }
        }).connect(delay);
        
        synth.volume.value = -16;
        scoreAudioRef.current = synth;
        
        // Create wrong sound effect - dreamy but dissonant
        const wrongReverb = new Reverb({
          decay: 2.5,
          wet: 0.5
        }).toDestination();

        const wrongChorus = new Chorus({
          frequency: 0.8,
          delayTime: 3,
          depth: 0.6,
          wet: 0.3
        }).connect(wrongReverb);
        
        const wrongDelay = new FeedbackDelay({
          delayTime: 0.3,
          feedback: 0.2,
          wet: 0.2
        }).connect(wrongChorus);
        
        const wrongSynth = new PolySynth(Synth, {
          oscillator: {
            type: "sine" // Soft oscillator type
          },
          envelope: {
            attack: 0.03, // Softer attack
            decay: 0.2,
            sustain: 0.1,
            release: 2.0 // Longer release for dreaminess
          }
        }).connect(wrongDelay);
        
        // Lower volume for wrong sound
        wrongSynth.volume.value = -15;
        wrongAudioRef.current = wrongSynth;

        // Store globally for access
        if (typeof window !== 'undefined') {
          (window as any).scoreAudio = synth;
          (window as any).wrongAudio = wrongSynth;
        }
      }).catch(err => {
        console.error("Failed to load Tone.js:", err);
      });
    }
    
    return () => {
      if (comboResetTimerRef.current) {
        clearTimeout(comboResetTimerRef.current);
      }
    };
  }, []);
  
  // Reset combo after delay
  const resetComboAfterDelay = useCallback(() => {
    // Clear any existing timer
    if (comboResetTimerRef.current) {
      clearTimeout(comboResetTimerRef.current);
    }
    
    // Set new timer to reset combo after 1 second of no hits
    comboResetTimerRef.current = window.setTimeout(() => {
      comboCountRef.current = 0;
      comboResetTimerRef.current = null;
    }, 1000);
  }, []);

  // Function to play score sound with combo system
  const playScoreSound = useCallback(() => {
    if (!scoreAudioRef.current) return;

    try {
      // Check if this is a combo (within 1 second of last hit)
      const now = Date.now();
      const timeSinceLastHit = now - lastHitTimeRef.current;
      
      if (timeSinceLastHit <= 1000 && lastHitTimeRef.current !== 0) {
        // This is a combo hit
        comboCountRef.current++;
      } else {
        // New combo starting
        comboCountRef.current = 0;
      }
      
      // Update last hit time
      lastHitTimeRef.current = now;
      
      // Reset combo timer
      resetComboAfterDelay();
      
      // Cap combo at 7 to prevent going too high
      const combo = Math.min(comboCountRef.current, 7);
      
      // Import Tone.js now() function dynamically
      import('tone').then(({ now }) => {
        // Get current combo level (capped at 7)
        const startTime = now();
        
        // Base chord - Cmaj7
        let notes = ['C5', 'E5', 'G5', 'B5'];
        
        // Modify notes based on combo level
        if (combo > 0) {
          // Progressively higher base notes for higher combos
          const baseNote = 5 + Math.min(combo, 3); // Go up to C8 max
          notes = [
            `C${baseNote}`, 
            `E${baseNote}`, 
            `G${baseNote}`, 
            `B${baseNote}`
          ];
          
          // For very high combos, add extra notes
          if (combo >= 3) {
            notes.push(`D${baseNote + 1}`); // Add a higher note
          }
          
          if (combo >= 5) {
            notes.push(`E${baseNote + 1}`); // Add even higher note
          }
        }
        
        // Increase velocity (volume) with combo - more dramatic increase
        const baseVelocity = 0.4; // Higher base velocity
        const velocityBoost = Math.min(combo * 0.08, 0.4); // Max +0.4 boost
        const velocities = notes.map(() => baseVelocity + velocityBoost);
        
        // Much tighter timing for immediate effect
        // Higher combos get even faster arpeggios
        const baseSpacing = 0.06; // Very quick base spacing
        const spacing = Math.max(baseSpacing - (combo * 0.01), 0.02); // Min 0.02s spacing
        
        // Play the notes - use shorter note length for snappier sound
        notes.forEach((note, i) => {
          scoreAudioRef.current.triggerAttackRelease(
            note, 
            i === 0 ? "8n" : "16n", // First note slightly longer, rest very short
            startTime + i * spacing, // Very fast spacing
            velocities[i]
          );
        });
      });
    } catch (error) {
      console.error("Error playing score sound:", error);
    }
  }, [resetComboAfterDelay]);

  // Add a function to play wrong sound
  const playWrongSound = useCallback(() => {
    if (!wrongAudioRef.current) return;
    
    try {
      // Import Tone.js now() function dynamically
      import('tone').then(({ now }) => {
        const startTime = now();
        
        // Play a dreamy dissonant chord that's in the same key area as the score sound
        // Using E minor with flat 9 (E, G, B, F) - all notes related to C major scale
        // but creating dissonance with the E-F relationship
        wrongAudioRef.current.triggerAttackRelease(['E4', 'G4', 'B4', 'F5'], '8n', startTime, 0.3);
      });
    } catch (error) {
      console.error("Error playing wrong sound:", error);
    }
  }, []);

  // Update the handleSphereCollision function to skip collisions when game is inactive
  const handleSphereCollision = (index: number) => {
    // Skip collisions when game is not active
    if (!gameActive) return;
    
    // Check if we've recently collided with this sphere
    if (recentCollisions.has(index)) {
      return; // Skip if already in recent collisions
    }
    
    const hitSphere = spherePositions[index];
    const playerColor = WINDOWS_COLORS[playerColorIndex];
    
    // Check if colors match (comparing hex values for consistency)
    const colorsMatch = playerColor.getHexString() === hitSphere.color.getHexString();
    
    if (colorsMatch) {
      // When colors match, update score, play sound, and respawn the sphere
      setScore((prevScore) => prevScore + 1);
      playScoreSound();
      
      // Trigger match hit visual effect - colored ripple
      const now = performance.now() / 1000; // Convert to seconds for shader
      
      // Create a fresh color object instead of relying on references
      const matchColor = new THREE.Color(
        playerColor.r,
        playerColor.g,
        playerColor.b
      );
      
      // Make it more vibrant 
      matchColor.multiplyScalar(1.5);
      
      // Special handling for green color which appears too dark
      if (playerColor.getHexString() === "7fba00") { // Green Windows color
        // Create a much brighter green that will be visible
        matchColor.setRGB(0.5, 1.0, 0.3); // Bright green
      }
      
      // Special handling for yellow which may appear reddish
      if (playerColor.getHexString() === "ffb900") { // Yellow Windows color
        // Create a brighter, clearer yellow with very high yellow component
        // and reduced red to avoid appearing reddish
        matchColor.setRGB(0.9, 1.0, 0.0); // Pure bright yellow
      }
      
      // Special handling for red which may need adjustment
      if (playerColor.getHexString() === "f25022") { // Red Windows color
        // Create a bright orange ripple instead of red
        matchColor.setRGB(1.0, 0.6, 0.1); // Bright orange
      }
      
      setMatchHitStatus({ 
        active: true, 
        time: now,
        color: matchColor
      });
      
      // Reset match hit effect after 0.5 seconds
      setTimeout(() => {
        setMatchHitStatus(prev => ({ ...prev, active: false }));
      }, 500);
      
      // Respawn the sphere with a new color when matched
      setSpherePositions((prevPositions) => {
        const newPositions = [...prevPositions];
          newPositions[index] = { 
            x: Math.random() * 50 - 25, 
            y: 0.7, 
            z: Math.random() * 50 - 25,
            color: getRandomWindowsColor()
          };
        return newPositions;
      });
    } else {
      // Play wrong sound when colors don't match
      playWrongSound();
      
      // Subtract 1 from score for mismatched color, but don't go below 0
      setScore((prevScore) => Math.max(0, prevScore - 1));
      
      // Trigger wrong hit visual effect - red ripple
      const now = performance.now() / 1000; // Convert to seconds for shader
      setWrongHitStatus({ active: true, time: now });
      
      // Reset wrong hit effect after 0.5 seconds
      setTimeout(() => {
        setWrongHitStatus({ active: false, time: now });
      }, 500);
      
      // Add to recent collisions
      setRecentCollisions(prev => {
        const updated = new Set(prev);
        updated.add(index);
        return updated;
      });
      
      // Remove from recent collisions after a delay (allowing the player to move away)
      setTimeout(() => {
        setRecentCollisions(prev => {
          const updated = new Set(prev);
          updated.delete(index);
          return updated;
        });
      }, 1000); // Need to move away for 1 second before retriggering
    }
  };

  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        <WaterFloor 
          playerPosition={{ x: explorerPosition.x, z: explorerPosition.z }}
          wrongHitStatus={wrongHitStatus}
          matchHitStatus={matchHitStatus}
        />
        
        {/* Fix-position objects */}
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048}
        />
        <ambientLight intensity={0.4} />
        
        <Grid />
        
        {/* Dynamic objects */}
        <group>
          {spherePositions.map((sphere, index) => (
            <mesh
              key={index}
              position={[sphere.x, sphere.y, sphere.z]}
              castShadow
            >
              <sphereGeometry args={[0.7, 32, 32]} />
              <meshStandardMaterial 
                color={sphere.color} 
                emissive={sphere.color} 
                emissiveIntensity={1.0} 
                toneMapped={false} 
              />
            </mesh>
          ))}
        </group>
        
        {/* Explorer sphere with camera */}
        <Explorer 
          onPositionChange={onPositionChange}
          touchControls={touchControls}
          spherePositions={spherePositions}
          handleCollision={handleSphereCollision}
          currentColor={WINDOWS_COLORS[playerColorIndex]}
          gameActive={gameActive}
        />
        
        {/* Timer Torus that follows player */}
        {gameActive && (
          <group position={[explorerPosition.x, 0, explorerPosition.z]}>
            <TorusTimer timeLeft={timeLeft} totalTime={totalTime} score={score} />
          </group>
        )}
        
        {/* Post-processing effects */}
        <PostProcessingEffects isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
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
function Explorer({ onPositionChange, touchControls, spherePositions, handleCollision, currentColor, gameActive }: { 
  onPositionChange: (position: { x: number, z: number }) => void,
  touchControls: { active: boolean, x: number, y: number },
  spherePositions: { x: number, y: number, z: number, color: THREE.Color }[],
  handleCollision: (index: number) => void,
  currentColor: THREE.Color,
  gameActive: boolean
}) {
  const { camera } = useThree()
  const sphereRef = useRef<THREE.Mesh>(null)
  
  // Use refs instead of state for frequently changing values
  const positionRef = useRef<{ x: number, z: number }>({ x: 0, z: 0 })
  const pulseIntensityRef = useRef<number>(1)
  const audioInitializedRef = useRef<boolean>(false)
  const audioPlayerRef = useRef<any>(null)
  
  // Keep state for values that don't change every frame
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false })
  
  // Refs for smooth camera movement
  const targetPositionRef = useRef<{ x: number, z: number }>({ x: 0, z: 0 })
  const cameraTargetRef = useRef<{ x: number, z: number }>({ x: 0, z: 12 })
  const isInitializedRef = useRef<boolean>(false)
  
  // Movement parameters
  const moveSpeed = 0.15
  const smoothingFactor = 0.1
  const cameraSmoothingFactor = 0.05
  
  // Initialize audio with Tone.js
  const initializeAudio = useCallback(() => {
    if (audioInitializedRef.current) return
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return
    
    console.log("Initializing audio with Tone.js")

    try {
      // Import Tone.js dynamically to avoid SSR issues
      import('tone').then(({ Player, start }) => {
        // Start Tone.js audio context
        start();
        
        // Create a player for the boat sound
        const player = new Player({
          url: "/sounds/boat.mp3",
          loop: true,
          volume: 0,
          onload: () => {
            audioInitializedRef.current = true;
            
            // Start playing immediately with volume 0 (silent)
            player.start();
          },
          onerror: (e) => {
            console.error("Error loading boat audio:", e);
          }
        }).toDestination();
      
      // Store reference
        audioPlayerRef.current = player;
      
        // Store globally for direct access from other components
      if (typeof window !== 'undefined') {
          (window as any).boatAudio = player;
          
        // Add direct volume control function for joystick
        (window as any).setBoatAudioVolume = (volume: number) => {
            if (player) {
              player.volume.value = convertToDb(volume);
          }
        };
      }
      }).catch(error => {
        console.error("Failed to load Tone.js:", error);
      });
    } catch (error) {
      console.error('Audio setup failed:', error)
    }
  }, []);
  
  // Convert linear volume (0-1) to dB (-60 to 0)
  const convertToDb = (linearVolume: number): number => {
    if (linearVolume <= 0) return -Infinity;
    return 20 * Math.log10(linearVolume);
  };
  
  // Update audio volume based on movement
  const updateAudio = useCallback(() => {
    if (!audioPlayerRef.current || !audioInitializedRef.current) return

    // More precise movement detection for both keyboard and touch controls
    const keyboardMoving = keys.w || keys.a || keys.s || keys.d;
    const touchMoving = touchControls.active && (Math.abs(touchControls.x) > 0.05 || Math.abs(touchControls.y) > 0.05);
    const isMoving = keyboardMoving || touchMoving;

    try {
      if (isMoving) {
        // Calculate target volume based on movement intensity
        const touchIntensity = touchMoving ? 
          Math.min(Math.sqrt(touchControls.x * touchControls.x + touchControls.y * touchControls.y), 1.0) : 0;
        
        // Use keyboard or touch controls, whichever is more intense
        const targetLinearVolume = 0.2 * (touchMoving ? touchIntensity : 1.0);
        
        // Set volume in dB (Tone.js uses dB scale)
        const targetDb = convertToDb(targetLinearVolume);
        
        // Smooth volume transition
        const currentDb = audioPlayerRef.current.volume.value;
        const newDb = currentDb < targetDb 
          ? Math.min(targetDb, currentDb + 3) // Faster ramp up
          : Math.max(targetDb, currentDb - 5); // Faster ramp down
          
        audioPlayerRef.current.volume.value = newDb;
      } else {
        // When not moving, ensure volume is being decreased
        const currentDb = audioPlayerRef.current.volume.value;
        if (currentDb > -60) {
          audioPlayerRef.current.volume.value = Math.max(-60, currentDb - 5);
        }
      }
    } catch (error) {
      console.error("Error updating audio:", error);
    }
  }, [keys, touchControls, convertToDb]);

  // Handle first user interaction for audio
  useEffect(() => {
    const handleFirstInteraction = (e: Event) => {
      // Only initialize audio on deliberate movement events (not color changes)
      if (e.type === 'keydown') {
        const keyEvent = e as KeyboardEvent;
        // If it's just a spacebar press for color change, don't initialize audio
        if (keyEvent.code === 'Space') {
          return;
        }
        
        // Other keys (like WASD for movement) should initialize audio
        if (!['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(keyEvent.code)) {
          return;
        }
      }
      
      // For mouse clicks, only initialize audio for deliberate movement clicks, not color changes
      if (e.type === 'click') {
        // Assume clicks are for color change, don't initialize audio
        return;
      }
      
      console.log("First user interaction detected!");
      initializeAudio();
      
      // Remove all event listeners
      window.removeEventListener('touchstart', handleFirstInteraction, true);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      document.body.removeEventListener('touchstart', handleFirstInteraction, true);
    };

    // Use capture phase to ensure we get the event first
    window.addEventListener('touchstart', handleFirstInteraction, { once: true, capture: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('click', handleFirstInteraction, { once: true });
    // Add directly to body as a backup
    document.body.addEventListener('touchstart', handleFirstInteraction, { once: true, capture: true });

    return () => {
      window.removeEventListener('touchstart', handleFirstInteraction, true);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('click', handleFirstInteraction);
      document.body.removeEventListener('touchstart', handleFirstInteraction, true);
    };
  }, [initializeAudio]);

  // Update audio based on movement
  useEffect(() => {
    if (!audioPlayerRef.current || !audioInitializedRef.current) return

    // Update audio immediately
    updateAudio()

    // Set up animation frame for smooth updates
    let frameId: number
    let lastUpdateTime = 0
    
    const animate = (timestamp: number) => {
      // Limit updates to every 50ms to avoid overwhelming the audio API
      if (timestamp - lastUpdateTime > 50) {
        updateAudio()
        lastUpdateTime = timestamp
      }
      
      frameId = requestAnimationFrame(animate)
    }
    
    frameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [updateAudio])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.stop();
          audioPlayerRef.current.dispose();
        } catch (e) {
          console.error("Error disposing audio player:", e);
        }
        audioPlayerRef.current = null;
        
        // Clean up global reference
        if (typeof window !== 'undefined') {
          (window as any).boatAudio = null;
          (window as any).setBoatAudioVolume = null;
        }
      }
      audioInitializedRef.current = false;
    }
  }, [])
  
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

  // Update position based on controls
  useFrame((state, delta) => {
    if (!sphereRef.current) return;

    // Ensure camera is in the correct position on first frame
    if (!isInitializedRef.current) {
      camera.position.set(0, 8, 12);
      camera.lookAt(0, 0, 0);
      isInitializedRef.current = true;
    }

    // Calculate target position based on WASD keys (direct movement)
    let targetX = targetPositionRef.current.x;
    let targetZ = targetPositionRef.current.z;

    // Only apply movement if game is active
    if (gameActive) {
      // Apply input to target position
      if (keys.w) targetZ -= moveSpeed; // Forward (north)
      if (keys.s) targetZ += moveSpeed; // Backward (south)
      if (keys.a) targetX -= moveSpeed; // Left (west)
      if (keys.d) targetX += moveSpeed; // Right (east)

      // Handle touch joystick input for mobile
      if (touchControls.active) {
        targetX += touchControls.x * moveSpeed;
        targetZ += touchControls.y * moveSpeed; // Negative sign to fix inverted Y-axis
      }
    }

    // Limit movement area
    const boundaryLimit = 40;
    targetX = Math.max(Math.min(targetX, boundaryLimit), -boundaryLimit);
    targetZ = Math.max(Math.min(targetZ, boundaryLimit), -boundaryLimit);

    // Update target position
    targetPositionRef.current = { x: targetX, z: targetZ };

    // Smoothly interpolate current position towards target position (exponential smoothing)
    const newX = positionRef.current.x + (targetX - positionRef.current.x) * smoothingFactor;
    const newZ = positionRef.current.z + (targetZ - positionRef.current.z) * smoothingFactor;

    // Only update if position changed significantly
    if (Math.abs(newX - positionRef.current.x) > 0.001 || Math.abs(newZ - positionRef.current.z) > 0.001) {
      // Update the ref instead of state
      positionRef.current = { x: newX, z: newZ };

      // Only call onPositionChange when position changes significantly
      onPositionChange({ x: newX, z: newZ });

      // Set camera target position
      cameraTargetRef.current = { 
        x: newX, 
        z: newZ + 12 // Keep camera behind the explorer
      };
    }

    // Smoothly move camera towards target position (with even more smoothing)
    camera.position.x += (cameraTargetRef.current.x - camera.position.x) * cameraSmoothingFactor;
    camera.position.z += (cameraTargetRef.current.z - camera.position.z) * cameraSmoothingFactor;

    // Smoothly look at the explorer's position
    const lookAtTarget = new THREE.Vector3(newX, 0, newZ);
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);

    const smoothLookAtX = currentLookAt.x + (lookAtTarget.x - currentLookAt.x) * cameraSmoothingFactor;
    const smoothLookAtY = currentLookAt.y + (lookAtTarget.y - currentLookAt.y) * cameraSmoothingFactor;
    const smoothLookAtZ = currentLookAt.z + (lookAtTarget.z - currentLookAt.z) * cameraSmoothingFactor;

    camera.lookAt(smoothLookAtX, smoothLookAtY, smoothLookAtZ);

    // Update sphere position
    sphereRef.current.position.x = newX;
    sphereRef.current.position.z = newZ;

    // Make the sphere bob up and down gently
    sphereRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05 + 0.5;

    // Pulsating effect for the sphere
    const newPulseIntensity = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    pulseIntensityRef.current = newPulseIntensity;

    if (sphereRef.current.material instanceof THREE.MeshStandardMaterial) {
      sphereRef.current.material.emissiveIntensity = newPulseIntensity;
    }

    // Update global explorer position for other components to access
    if (typeof window !== 'undefined') {
      (window as any).explorerPosition = { x: newX, z: newZ };
    }

    // Only check collisions if game is active
    if (gameActive) {
      // Collision detection with other spheres
      spherePositions.forEach((spherePos: { x: number, y: number, z: number }, index: number) => {
        const distance = Math.sqrt(
          Math.pow(newX - spherePos.x, 2) +
          Math.pow(newZ - spherePos.z, 2)
        );

        // Check if collision occurs (assuming both spheres have a radius of 0.5)
        if (distance < 1.0) {
          handleCollision(index);
        }
      });
    }
  })
  
  return (
    <mesh ref={sphereRef} position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial 
        color={currentColor} 
        emissive={currentColor} 
        emissiveIntensity={pulseIntensityRef.current}
        toneMapped={false}
      />
    </mesh>
  )
}

// Update the Joystick component to work with Tone.js
function Joystick({ setTouchControls }: { setTouchControls: (controls: { active: boolean, x: number, y: number }) => void }) {
  const joystickContainerRef = useRef<HTMLDivElement>(null)
  const joystickManagerRef = useRef<any>(null)
  const audioInitializedRef = useRef<boolean>(false)
  
  // Init audio function - call this before audio operations
  const initAudio = useCallback(() => {
    if (audioInitializedRef.current) return true
    
    if (typeof window !== 'undefined' && (window as any).boatAudio) {
      audioInitializedRef.current = true
      return true
    }
    
    // If we don't have audio yet, check if we need to initialize it
    if (typeof window !== 'undefined' && !audioInitializedRef.current) {
      // Trigger a simulated interaction to initialize audio
      const event = new Event('touchstart', { bubbles: true })
      document.body.dispatchEvent(event)
      
      // Also trigger a click for browsers that might need it
      const clickEvent = new Event('click', { bubbles: true })
      document.body.dispatchEvent(clickEvent)
      
      // Try to start Tone.js audio context directly
      import('tone').then(({ start }) => {
        start().then(() => {
          console.log("Tone.js audio context started from joystick");
        }).catch(e => {
          console.error("Failed to start Tone.js audio context:", e);
        });
      }).catch(e => {
        console.error("Failed to import Tone.js:", e);
      });
      
      // Wait a moment for audio to initialize
      setTimeout(() => {
        audioInitializedRef.current = true
      }, 300)
    }
    
    return false
  }, [])
  
  // Direct access to audio for stopping
  const stopAudio = useCallback(() => {
    // First make sure audio is initialized
    if (!initAudio()) return
    
    // Find the audio element directly if it exists
    if (typeof window !== 'undefined') {
      // Use the global volume control function
      if ((window as any).setBoatAudioVolume) {
        console.log("Joystick setting audio volume to -Infinity dB");
        (window as any).setBoatAudioVolume(0);
      }
    }
  }, [initAudio])
  
  // Control audio volume based on joystick movement
  const updateAudioVolume = useCallback((x: number, y: number) => {
    // First make sure audio is initialized
    if (!initAudio()) return
    
    if (typeof window !== 'undefined' && (window as any).setBoatAudioVolume) {
      const intensity = Math.min(Math.sqrt(x*x + y*y), 1.0)
      // Scale to reasonable volume
      const volume = intensity * 0.2
      
      ;(window as any).setBoatAudioVolume(volume)
    }
  }, [initAudio])
  
  useEffect(() => {
    if (!joystickContainerRef.current || typeof window === 'undefined') return
    
    // Initialize audio when joystick component mounts
    initAudio()
    
    // Dynamically import nipplejs only in browser
    const initJoystick = async () => {
      try {
        const nipplejs = (await import('nipplejs')).default
        
        // Create nipplejs joystick - ensure zone is not null
        if (joystickContainerRef.current) {
          const manager = nipplejs.create({
            zone: joystickContainerRef.current,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
            size: 120,
            dynamicPage: true
          })
          
          joystickManagerRef.current = manager
          
          // Handle joystick events
          manager.on('start', () => {
            setTouchControls({ active: true, x: 0, y: 0 })
            // Initialize audio on joystick start
            initAudio()
          })
          
          manager.on('move', (evt, data) => {
            if (!data || !data.vector) return
            
            const { x, y } = data.vector
            // Adjust Y vector to match the original implementation (may need to be flipped)
            setTouchControls({ active: true, x, y: -y }) // Negative y to match original
            
            // Update audio volume based on joystick movement
            updateAudioVolume(x, -y)
          })
          
          manager.on('end', () => {
            setTouchControls({ active: false, x: 0, y: 0 })
            stopAudio()
          })
        }
      } catch (error) {
        console.error('Error creating nipplejs:', error)
      }
    }
    
    initJoystick()
    
    // Cleanup function
    return () => {
      if (joystickManagerRef.current) {
        joystickManagerRef.current.destroy()
      }
      stopAudio()
    }
  }, [setTouchControls, stopAudio, initAudio, updateAudioVolume])
  
  return (
    <div 
      ref={joystickContainerRef}
      className="fixed bottom-24 right-8 w-32 h-32 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 md:hidden joystick-container"
    />
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

// Replace the PreGameOverlay component
function PreGameOverlay({ onStart }: { onStart: () => void }) {
  // State for the animated color cycling
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    
    if (typeof window !== 'undefined') {
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkIfMobile);
      }
    };
  }, []);
  
  // Set up color cycling animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColorIndex(prev => (prev + 1) % WINDOWS_COLOR_HEX.length);
    }, 1000); // Change color every second
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="bg-black border border-zinc-800 rounded-xl max-w-[360px] w-full py-6 px-5 shadow-xl mx-auto relative">
        {/* Dreampop logo */}
        <div className="flex justify-center mb-3">
          <Image 
            src="/dreampopWeb.png" 
            alt="DreamPop"
            width={256}
            height={75}
            priority
            className="max-w-full h-auto"
          />
        </div>
        
        {/* Game taglines */}
        <div className="text-center mb-4">
          <p className="text-base">Hit matching colored spheres to score!</p>
          <p className="text-sm text-zinc-400 mt-1">Beat the clock. How high can you go?</p>
        </div>
        
        {/* Compact controls layout - two columns */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Left column - Color change */}
          <div className="flex flex-col items-center">
            {/* Color box aligned with text - consistent height container */}
            <div className="flex items-center justify-center h-10">
              <div 
                className="w-6 h-6 rounded-full transition-colors duration-500"
                style={{ backgroundColor: WINDOWS_COLOR_HEX[currentColorIndex] }}
              />
            </div>
            <div className="text-center mt-1">
              <p className="text-xs font-bold mb-1">CHANGE COLOR</p>
              <p className="text-xs text-zinc-400">
                {isMobile ? "(TAP SCREEN)" : "(SPACEBAR)"}
              </p>
            </div>
          </div>
          
          {/* Right column - Movement */}
          <div className="flex flex-col items-center">
            {/* WASD keys or joystick icon based on device - consistent height container */}
            <div className="flex items-center justify-center h-10">
              {isMobile ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" />
                  <circle cx="12" cy="12" r="3" fill="white" />
                </svg>
              ) : (
                <div className="grid grid-cols-3 gap-0.5">
                  <div className="w-5 h-5"></div>
                  <div className="w-5 h-5 border border-white flex items-center justify-center">
                    <span className="text-[10px]">W</span>
                  </div>
                  <div className="w-5 h-5"></div>
                  
                  <div className="w-5 h-5 border border-white flex items-center justify-center">
                    <span className="text-[10px]">A</span>
                  </div>
                  <div className="w-5 h-5 border border-white flex items-center justify-center">
                    <span className="text-[10px]">S</span>
                  </div>
                  <div className="w-5 h-5 border border-white flex items-center justify-center">
                    <span className="text-[10px]">D</span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-center mt-1">
              <p className="text-xs font-bold mb-1">MOVE</p>
              <p className="text-xs text-zinc-400">
                {isMobile ? "(JOYSTICK)" : "(WASD)"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Point system summary - compact horizontal */}
        <div className="flex justify-center gap-8 text-center mb-5">
          <div>
            <div className="flex items-center justify-center mb-1.5">
              <div className="w-5 h-5 rounded-full mr-2" style={{ backgroundColor: WINDOWS_COLOR_HEX[0] }}></div>
              <span className="text-base">→</span>
              <div className="w-5 h-5 rounded-full ml-2" style={{ backgroundColor: WINDOWS_COLOR_HEX[0] }}></div>
            </div>
            <p className="text-xs text-zinc-300">+1 POINT</p>
          </div>
          
          <div>
            <div className="flex items-center justify-center mb-1.5">
              <div className="w-5 h-5 rounded-full mr-2" style={{ backgroundColor: WINDOWS_COLOR_HEX[2] }}></div>
              <span className="text-base">→</span>
              <div className="w-5 h-5 rounded-full ml-2" style={{ backgroundColor: WINDOWS_COLOR_HEX[3] }}></div>
            </div>
            <p className="text-xs text-zinc-300">-1 POINT</p>
          </div>
        </div>
        
        {/* Start button */}
        <button 
          onClick={onStart}
          className="block w-full max-w-[240px] mx-auto py-2.5 bg-gradient-to-r from-[#f25022] via-[#ffb900] via-[#7fba00] to-[#00a4ef] opacity-70 hover:opacity-100 rounded-lg transition-opacity duration-300 ease-in-out"
          style={{ backgroundSize: '100% auto', animation: 'gradient-move 4s linear infinite' }}
        >
          S T A R T
        </button>
        
        {/* Creator credit */}
        <div className="absolute bottom-[-24px] right-3">
          <a 
            href="https://x.com/Kaberikram" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            created by @Kaberikram
          </a>
        </div>
      </div>
    </div>
  );
}

// Update the PostGameOverlay component for mobile
function PostGameOverlay({
  score,
  onReplay
}: {
  score: number,
  onReplay: () => void
}) {
  const [playerName, setPlayerName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [errorLeaderboard, setErrorLeaderboard] = useState<string | null>(null);
  const [playerRank, setPlayerRank] = useState<number | null>(null); // Add state for player rank
  const [isSubmitting, setIsSubmitting] = useState(false); // Add state for submission process

  // Fetch leaderboard data on mount
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    if (!supabaseUrl || !supabaseAnonKey) return; // Don't fetch if keys missing
    
    setLoadingLeaderboard(true);
    setErrorLeaderboard(null);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('name, score')
        .order('score', { ascending: false })
        .limit(5); // Fetch top 5 scores

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      setErrorLeaderboard('Failed to load leaderboard.');
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Handle form submission to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = playerName.trim();
    if (!trimmedName || !supabaseUrl || !supabaseAnonKey || isSubmitting) return;

    setIsSubmitting(true);
    setPlayerRank(null); // Reset rank before submitting
    setErrorLeaderboard(null); // Clear previous errors

    try {
      // 1. Insert the score
      const { error: insertError } = await supabase
        .from('leaderboard')
        .insert([{ name: trimmedName, score: score }]);

      if (insertError) throw insertError;
      
      // 2. Calculate the rank
      const { count, error: rankError } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true }) // Only fetch the count
        .gt('score', score); // Count players with score > current player's score

      if (rankError) throw rankError;

      setPlayerRank(count !== null ? count + 1 : null);
      setIsSubmitted(true); // Mark as fully submitted *after* rank is calculated
      
      // 3. Refresh leaderboard (optional, can happen after showing rank)
      fetchLeaderboard(); 

    } catch (error: any) {
      console.error('Error submitting score or getting rank:', error);
      setErrorLeaderboard("Failed to submit score or get rank.");
      // Don't set isSubmitted to true if there was an error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
      <div className="bg-black border border-zinc-800 rounded-xl max-w-[360px] w-full py-7 px-5 shadow-xl mx-auto relative">
        <h1 className="text-3xl font-bold text-center mb-4">Dream Over</h1>

        {/* Score display */}
        <div className="mb-6 text-center relative bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 to-blue-500 p-0.5 rounded-lg">
          <div className="bg-black rounded-lg px-4 py-3">
            <p className="text-xs text-zinc-400 mb-1">Your Aura Points</p>
            <p className="text-4xl font-bold text-white">{score}</p>
          </div>
        </div>

        {/* Name input form or submitted message */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-xs font-medium mb-2 text-center">
              Enter your name for the leaderboard
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00a4ef]"
                placeholder="Your name"
                maxLength={15}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting} // Disable button while submitting
                className={`bg-[#7fba00] rounded-lg px-4 py-2.5 text-xs font-medium transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#8dce14]'}`}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Submit'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-zinc-900/50 rounded-lg p-3 mb-6 text-center">
            <p className="text-sm mb-1">
              Thanks for playing, <span className="font-bold">{playerName}</span>!
            </p>
            {playerRank !== null && (
              <p className="text-xs text-zinc-400">
                You ranked #{playerRank}!
              </p>
            )}
            {/* Show submit error here if needed */}
            {errorLeaderboard && !isSubmitting && (
              <p className="text-xs text-red-500 mt-1">{errorLeaderboard}</p>
            )}
          </div>
        )}

        {/* Leaderboard display */}
        <div className="mb-6">
           <h2 className="text-sm font-semibold mb-2 text-center">Auraboard</h2>
           {/* Loading and Error States */}
           {loadingLeaderboard && (
             <div className="flex justify-center items-center h-24">
               <Loader2 className="h-6 w-6 animate-spin" />
             </div>
           )}
           {!loadingLeaderboard && !errorLeaderboard && leaderboard.length > 0 && (
             <div className="space-y-1 text-xs">
               <div className="grid grid-cols-[auto,1fr,auto] gap-2 px-2 py-1 text-zinc-500 font-medium">
                 <span>#</span>
                 <span>Name</span>
                 <span>Aura Points</span>
               </div>
               {leaderboard.map((entry, index) => (
                 <div key={entry.id || index} className="grid grid-cols-[auto,1fr,auto] gap-2 px-2 py-1 rounded bg-zinc-900/50 items-center">
                   <span className="text-zinc-400">{index + 1}</span>
                   <span className="truncate text-white">{entry.name}</span>
                   <span className="font-semibold text-white">{entry.score}</span>
                 </div>
               ))}
             </div>
           )}
           {/* Empty State */}
           {!loadingLeaderboard && !errorLeaderboard && leaderboard.length === 0 && (
             <p className="text-xs text-zinc-500 text-center">No scores yet!</p>
           )}
           {/* Error Display (Combined) */} 
           {errorLeaderboard && !loadingLeaderboard && (
             <p className="text-xs text-red-500 text-center mt-1 px-2">{errorLeaderboard}</p>
           )}
        </div>

        {/* Replay Button */}
        <button
          onClick={onReplay}
          className="w-full text-white font-bold py-2 px-4 rounded-lg relative overflow-hidden group flex items-center justify-center transition-all duration-300 ease-in-out h-10 text-lg"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#f25022] via-[#ffb900] via-[#7fba00] to-[#00a4ef] opacity-50 group-hover:opacity-100 rounded-lg transition-opacity duration-300 ease-in-out"
            style={{ backgroundSize: '100% auto', animation: 'gradient-move 4s linear infinite' }}
          ></div>
          <span className="relative z-10">Pop Again!</span>
        </button>

        {/* Share Buttons */}
        <ScoreShareButtons score={score} /> 
      </div>
    </div>
  );
}

// Add ScoreShareButtons component
function ScoreShareButtons({ score }: { score: number }) {
  const shareTextBase = `I scored ${score} Aura Points in DreamPop! Can you beat my score? ✨🌙`;
  const shareUrl = 'https://www.aetherialdream.com/dreampop'; // Make sure this is the correct URL

  const handleShareToX = () => {
    const text = encodeURIComponent(`${shareTextBase} #DreamPop #AetherialDream`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://x.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  return (
    <div className="mt-4"> {/* Removed flex classes */}
      <button
        onClick={handleShareToX}
        className="w-full text-white bg-black hover:bg-zinc-800 border border-zinc-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm" /* Made button full width */
      >
        Share on X
      </button>
    </div>
  );
}

// Replace the TorusTimer component
function TorusTimer({ timeLeft, totalTime, score }: { timeLeft: number, totalTime: number, score: number }) {
  const percentage = Math.max(0, timeLeft / totalTime);
  
  // Determine color based on time left using Windows logo colors
  const color = useMemo(() => {
    if (percentage > 0.6) return new THREE.Color(WINDOWS_COLOR_HEX[2]); // Green (index 2)
    if (percentage > 0.3) return new THREE.Color(WINDOWS_COLOR_HEX[1]); // Yellow (index 1)
    return new THREE.Color(WINDOWS_COLOR_HEX[0]); // Red (index 0)
  }, [percentage]);

  return (
    <group position={[0, 2.2, 0]}>
      {/* Colored progress torus for time */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.05, 16, 100, Math.PI * 2 * percentage]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      
      {/* Display score in the middle */}
      <Text 
        position={[0, 0, 0]} 
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {score}
      </Text>
    </group>
  );
}

// Main scene component that handles loading (now the main client component)
export function DreampopClient() {
  const [error, setError] = useState<string | null>(null)
  const [explorerPosition, setExplorerPosition] = useState({ x: 0, z: 0 })
  const [showInstructions, setShowInstructions] = useState(false)
  const [touchControls, setTouchControls] = useState({ active: false, x: 0, y: 0 })
  
  // Add new state variables for game flow
  const [gameState, setGameState] = useState<GameState>("PRE_GAME")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60) // 60 seconds timer
  const GAME_DURATION = 60 // in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start game function
  const startGame = useCallback(() => {
    setGameState("PLAYING")
    setScore(0)
    setTimeLeft(GAME_DURATION)
    
    // Start the timer
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          // Game over when timer runs out
          if (timerRef.current) clearInterval(timerRef.current)
          setGameState("POST_GAME")
          return 0
        }
        return prev - 0.1 // Update every 100ms for smoother countdown
      })
    }, 100)
  }, [])
  
  // Reset game function
  const resetGame = useCallback(() => {
    setGameState("PRE_GAME")
    setScore(0) // Reset score to 0
    setExplorerPosition({ x: 0, z: 0 }) // Reset position to origin
    // Reset global position reference
    if (typeof window !== 'undefined') {
      (window as any).explorerPosition = { x: 0, z: 0 }
    }
  }, [])
  
  // Handle score updates from DreamScene
  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handlePositionChange = (position: { x: number, z: number }) => {
    setExplorerPosition(position)
    // Update global position for persistence
    if (typeof window !== 'undefined') {
      (window as any).explorerPosition = position
    }
  }

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions)
  }

  // Set document title dynamically - this will override the metadata title, which is fine
  useEffect(() => {
    document.title = "Dreampop";
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-black text-white">
      {/* Pre-game overlay */}
      {gameState === "PRE_GAME" && <PreGameOverlay onStart={startGame} />}
      
      {/* Post-game overlay */}
      {gameState === "POST_GAME" && (
        <PostGameOverlay 
          score={score} 
          onReplay={resetGame} 
        />
      )}
      
      {/* Instructions Panel */}
      {gameState === "PLAYING" && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="relative">
            {showInstructions && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-black/90 border border-zinc-800 rounded-lg shadow-lg">
                <div className="p-3">
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span>⌨️</span>
                      <span>WASD keys to move</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>📱</span>
                      <span>Joystick on mobile</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🎮</span>
                      <span>SPACE or CLICK to change color</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span>🎯</span>
                      <span>Match colors to score points</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <button 
              onClick={toggleInstructions}
              className="flex items-center gap-2 px-3 py-1.5 bg-black/90 border border-zinc-800 rounded-full hover:bg-black/70 transition-colors"
            >
              <span>?</span>
              <span className="text-xs">Controls</span>
              {showInstructions ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <div className="absolute inset-0">
        <ErrorBoundary fallback={<div>Something went wrong with the 3D scene</div>}>
          <DreamScene 
            explorerPosition={explorerPosition}
            onPositionChange={handlePositionChange}
            touchControls={touchControls}
            setTouchControls={setTouchControls}
            gameActive={gameState === "PLAYING"}
            onScoreUpdate={handleScoreUpdate}
            initialScore={gameState === "PRE_GAME" ? 0 : score}
            timeLeft={timeLeft}
            totalTime={GAME_DURATION}
          />
        </ErrorBoundary>
      </div>

      {/* Mobile Controls - only show during gameplay */}
      {gameState === "PLAYING" && <Joystick setTouchControls={setTouchControls} />}
    </div>
  )
}

// Add TypeScript declaration for the global window object
declare global {
  interface Window {
    explorerPosition?: { x: number, z: number }
    scoreAudio?: any // Add references for global audio access
    wrongAudio?: any
    boatAudio?: any
    setBoatAudioVolume?: (volume: number) => void
  }
} 