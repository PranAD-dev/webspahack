import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MOODS, type JournalEntry } from '../types';
import { JournalEntryCard } from '../components/JournalEntryCard';
import { BackButton } from '../components/BackButton';
import './EmotionBubble.css';

interface Bubble {
  mesh: THREE.Mesh;
  mood: typeof MOODS[0];
  velocity: THREE.Vector3;
  position: THREE.Vector3;
  radius: number;
  textSprite?: THREE.Sprite;
}

export function EmotionBubble() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const draggedBubbleRef = useRef<Bubble | null>(null);
  const dragPlaneRef = useRef<THREE.Plane | null>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPosRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const entriesRef = useRef<JournalEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<JournalEntry[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load entries to determine bubble sizes and for filtering
    let entries: JournalEntry[] = [];
    try {
      const stored = localStorage.getItem('journalEntries');
      if (stored) {
        const parsed = JSON.parse(stored);
        entries = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          mood: MOODS.find(m => m.id === entry.mood.id) || entry.mood,
        }));
      }
    } catch (e) {
      console.error('Error loading entries:', e);
    }
    
    // Store entries in ref for filtering (accessible in event handlers)
    entriesRef.current = entries;

    // Count entries per mood
    const moodCounts = new Map<string, number>();
    entries.forEach(entry => {
      const count = moodCounts.get(entry.mood.id) || 0;
      moodCounts.set(entry.mood.id, count + 1);
    });

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera setup - move back to see larger bubbles
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25; // Move camera back to see larger bubbles
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // Transparent background
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Create bubbles with 6 colors and emotions
    const bubbleData = [
      { color: new THREE.Color(0x4A90E2), emotion: 'Sad', moodId: 'sad' },      // Blue
      { color: new THREE.Color(0xE74C3C), emotion: 'Angry', moodId: 'anxious' },    // Red (using anxious as closest)
      { color: new THREE.Color(0xF1C40F), emotion: 'Anxious', moodId: 'anxious' },  // Yellow
      { color: new THREE.Color(0x2ECC71), emotion: 'Calm', moodId: 'calm' },     // Green
      { color: new THREE.Color(0xFF69B4), emotion: 'Happy', moodId: 'happy' },   // Pink
      { color: new THREE.Color(0x9B59B6), emotion: 'Grateful', moodId: 'grateful' }, // Purple
    ];

    // All bubbles same size - large enough to take up 50% of screen
    const radius = 5;
    const bubbles: Bubble[] = [];

    // Create 6 bubbles, spread them out in a 3D arrangement to avoid overlap
    // Positions arranged in a sphere pattern with larger spacing (radius = 5, so need at least 12 units apart)
    // Minimum distance between centers: 2 * radius + buffer = 2 * 5 + 2 = 12 units
    const spreadPositions = [
      new THREE.Vector3(-14, 0, 0),      // Blue (Sad) - Left
      new THREE.Vector3(14, 0, 0),       // Red (Angry) - Right
      new THREE.Vector3(0, 12, -8),      // Yellow (Anxious) - Top back
      new THREE.Vector3(0, -12, 8),      // Green (Calm) - Bottom front
      new THREE.Vector3(-10, 6, 6),     // Pink (Happy) - Top left front
      new THREE.Vector3(10, -6, -6),    // Purple (Grateful) - Bottom right back
    ];

    // Helper function to create text sprite
    const createTextSprite = (text: string) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;

      canvas.width = 512;
      canvas.height = 256;
      
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set text style
      context.font = 'bold 80px Arial';
      context.fillStyle = '#ffffff';
      context.strokeStyle = '#000000';
      context.lineWidth = 8;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      // Draw text with outline
      context.strokeText(text, canvas.width / 2, canvas.height / 2);
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
      });
      
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(3, 1.5, 1); // Scale to fit on bubble
      
      return sprite;
    };

    bubbleData.forEach((data, index) => {
      const { color, emotion, moodId } = data;
      
      // Create sphere geometry
      const geometry = new THREE.SphereGeometry(radius, 32, 32);

      // Create material with color
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        emissive: color,
        emissiveIntensity: 0.3,
        shininess: 100,
        specular: new THREE.Color(0xffffff),
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Use spread out positions
      const position = spreadPositions[index].clone();
      mesh.position.copy(position);

      // Very subtle initial velocity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01
      );

      // Create text sprite for emotion label - ensure it's always visible
      const textSprite = createTextSprite(emotion);
      if (textSprite) {
        // Position text on the front of the bubble, facing camera
        textSprite.position.copy(position);
        // Position it slightly in front of the bubble surface
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        textSprite.position.add(direction.multiplyScalar(-(radius + 1)));
        scene.add(textSprite);
      }

      // Create a mood object for the bubble with the actual mood from MOODS
      const actualMood = MOODS.find(m => m.id === moodId) || MOODS[0];
      const bubbleMood = { ...actualMood, name: emotion }; // Override name with emotion label
      
      scene.add(mesh);
      bubbles.push({ 
        mesh, 
        mood: bubbleMood, 
        velocity, 
        position: position.clone(), 
        radius,
        textSprite: textSprite || undefined
      });
    });

    bubblesRef.current = bubbles;

    // Run collision detection once on initialization to fix any overlaps
    const fixInitialOverlaps = () => {
      const minSeparation = radius * 2 + 2;
      let iterations = 0;
      const maxIterations = 50;
      
      while (iterations < maxIterations) {
        let hasOverlap = false;
        
        for (let i = 0; i < bubbles.length; i++) {
          for (let j = i + 1; j < bubbles.length; j++) {
            const bubble1 = bubbles[i];
            const bubble2 = bubbles[j];
            
            const distance = bubble1.mesh.position.distanceTo(bubble2.mesh.position);
            
            if (distance < minSeparation && distance > 0) {
              hasOverlap = true;
              const direction = new THREE.Vector3()
                .subVectors(bubble1.mesh.position, bubble2.mesh.position)
                .normalize();
              
              const overlap = minSeparation - distance;
              const separation = direction.multiplyScalar(overlap * 0.5);
              
              bubble1.mesh.position.add(separation);
              bubble2.mesh.position.sub(separation);
              bubble1.position.copy(bubble1.mesh.position);
              bubble2.position.copy(bubble2.mesh.position);
            }
          }
        }
        
        if (!hasOverlap) break;
        iterations++;
      }
      
      // Update all text sprite positions after fixing overlaps
      bubbles.forEach(bubble => {
        if (bubble.textSprite) {
          bubble.textSprite.position.copy(bubble.mesh.position);
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);
          bubble.textSprite.position.add(direction.multiplyScalar(-(radius + 1)));
        }
      });
    };

    // Fix any initial overlaps before starting
    fixInitialOverlaps();

    // Initialize raycaster for drag detection
    raycasterRef.current = new THREE.Raycaster();
    dragPlaneRef.current = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    // Mouse/Touch event handlers for dragging and clicking
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!camera || !renderer) return;

      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      // Store initial mouse position to detect drag vs click
      dragStartPosRef.current.set(clientX, clientY);

      // Update mouse position
      mouseRef.current.x = (clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(clientY / window.innerHeight) * 2 + 1;

      // Raycast to find which bubble was clicked
      raycasterRef.current!.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current!.intersectObjects(
        bubbles.map(b => b.mesh)
      );

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const clickedBubble = bubbles.find(b => b.mesh === clickedMesh);
        
        if (clickedBubble) {
          draggedBubbleRef.current = clickedBubble;
          isDraggingRef.current = false; // Will be set to true if mouse moves
          
          // Create a plane perpendicular to camera for dragging
          const normal = new THREE.Vector3();
          camera.getWorldDirection(normal);
          dragPlaneRef.current!.normal.copy(normal);
          dragPlaneRef.current!.constant = -normal.dot(clickedBubble.mesh.position);
        }
      }
    };

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      if (!draggedBubbleRef.current || !camera) return;

      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      // Check if mouse moved significantly (drag threshold)
      const dragThreshold = 5; // pixels
      const mouseMoved = Math.abs(clientX - dragStartPosRef.current.x) > dragThreshold ||
                        Math.abs(clientY - dragStartPosRef.current.y) > dragThreshold;

      if (mouseMoved) {
        isDraggingRef.current = true;
        event.preventDefault();
      }

      if (!isDraggingRef.current) return;

      // Update mouse position
      mouseRef.current.x = (clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(clientY / window.innerHeight) * 2 + 1;

      // Raycast to find intersection with drag plane
      raycasterRef.current!.setFromCamera(mouseRef.current, camera);
      const intersection = new THREE.Vector3();
      raycasterRef.current!.ray.intersectPlane(dragPlaneRef.current!, intersection);

      if (intersection) {
        // Update bubble position
        draggedBubbleRef.current.mesh.position.copy(intersection);
        draggedBubbleRef.current.position.copy(intersection);
        
        // Update text sprite position
        if (draggedBubbleRef.current.textSprite) {
          draggedBubbleRef.current.textSprite.position.copy(intersection);
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);
          draggedBubbleRef.current.textSprite.position.add(direction.multiplyScalar(-(radius + 1)));
        }
      }
    };

    const onPointerUp = () => {
      const wasDragging = isDraggingRef.current;
      const clickedBubble = draggedBubbleRef.current;

      if (wasDragging && clickedBubble) {
        // Reset velocity when released after dragging
        clickedBubble.velocity.set(0, 0, 0);
      } else if (clickedBubble && !wasDragging) {
        // It was a click, not a drag - show entries for this emotion
        const moodId = clickedBubble.mood.id;
        // Filter entries that match this mood
        const filteredEntries = entriesRef.current.filter(entry => entry.mood.id === moodId);
        setSelectedEntries(filteredEntries);
        setSelectedEmotion(clickedBubble.mood.name);
      }

      draggedBubbleRef.current = null;
      isDraggingRef.current = false;
    };

    // Add event listeners
    containerRef.current.addEventListener('mousedown', onPointerDown);
    containerRef.current.addEventListener('mousemove', onPointerMove);
    containerRef.current.addEventListener('mouseup', onPointerUp);
    containerRef.current.addEventListener('touchstart', onPointerDown, { passive: false });
    containerRef.current.addEventListener('touchmove', onPointerMove, { passive: false });
    containerRef.current.addEventListener('touchend', onPointerUp);

    // Collision detection and repulsion - ensure bubbles never overlap or touch
    const checkCollisions = () => {
      const minSeparation = radius * 2 + 2; // Minimum distance between bubble centers (diameter + 2 unit buffer)

      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const bubble1 = bubbles[i];
          const bubble2 = bubbles[j];
          
          // Skip collision check if either bubble is being dragged
          if (draggedBubbleRef.current === bubble1 || draggedBubbleRef.current === bubble2) {
            continue;
          }
          
          const distance = bubble1.mesh.position.distanceTo(bubble2.mesh.position);

          if (distance < minSeparation && distance > 0) {
            // Calculate direction from bubble2 to bubble1
            const direction = new THREE.Vector3()
              .subVectors(bubble1.mesh.position, bubble2.mesh.position)
              .normalize();

            // Calculate how much they need to separate
            const overlap = minSeparation - distance;
            const separation = direction.multiplyScalar(overlap * 0.5);
            
            // Move bubbles apart immediately (since they're static)
            bubble1.mesh.position.add(separation);
            bubble2.mesh.position.sub(separation);
            
            // Update position reference
            bubble1.position.copy(bubble1.mesh.position);
            bubble2.position.copy(bubble2.mesh.position);
            
            // Update text sprite positions
            if (bubble1.textSprite) {
              bubble1.textSprite.position.copy(bubble1.mesh.position);
              const direction1 = new THREE.Vector3();
              camera.getWorldDirection(direction1);
              bubble1.textSprite.position.add(direction1.multiplyScalar(-(radius + 1)));
            }
            if (bubble2.textSprite) {
              bubble2.textSprite.position.copy(bubble2.mesh.position);
              const direction2 = new THREE.Vector3();
              camera.getWorldDirection(direction2);
              bubble2.textSprite.position.add(direction2.multiplyScalar(-(radius + 1)));
            }
          }
        }
      }
    };

    // Boundary collision - keep bubbles within view
    const checkBoundaries = (bubble: Bubble) => {
      const bounds = 15; // Larger bounds to allow more spread
      const damping = 0.9;

      if (Math.abs(bubble.mesh.position.x) > bounds) {
        bubble.velocity.x *= -damping;
        bubble.mesh.position.x = Math.sign(bubble.mesh.position.x) * bounds;
      }
      if (Math.abs(bubble.mesh.position.y) > bounds) {
        bubble.velocity.y *= -damping;
        bubble.mesh.position.y = Math.sign(bubble.mesh.position.y) * bounds;
      }
      if (Math.abs(bubble.mesh.position.z) > bounds) {
        bubble.velocity.z *= -damping;
        bubble.mesh.position.z = Math.sign(bubble.mesh.position.z) * bounds;
      }
    };

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Update bubble positions
      bubbles.forEach((bubble) => {
        // If bubble is being dragged, only update text sprite position
        if (draggedBubbleRef.current === bubble) {
          // Check boundaries while dragging to keep within view
          checkBoundaries(bubble);
          
          if (bubble.textSprite) {
            bubble.textSprite.position.copy(bubble.mesh.position);
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);
            bubble.textSprite.position.add(direction.multiplyScalar(-(radius + 1)));
          }
          return;
        }

        // Bubbles stay in place - no automatic movement
        // Only gentle rotation for visual interest
        bubble.mesh.rotation.x += 0.002;
        bubble.mesh.rotation.y += 0.003;
        bubble.mesh.rotation.z += 0.001;

        // Update text sprite position to follow bubble and face camera
        if (bubble.textSprite) {
          bubble.textSprite.position.copy(bubble.mesh.position);
          // Make text always face camera (sprites do this automatically, but position it in front)
          const direction = new THREE.Vector3();
          camera.getWorldDirection(direction);
          bubble.textSprite.position.add(direction.multiplyScalar(-(radius + 1)));
        }
      });

      // Check collisions
      checkCollisions();

      // Render
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      
      // Remove drag event listeners
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', onPointerDown);
        containerRef.current.removeEventListener('mousemove', onPointerMove);
        containerRef.current.removeEventListener('mouseup', onPointerUp);
        containerRef.current.removeEventListener('touchstart', onPointerDown);
        containerRef.current.removeEventListener('touchmove', onPointerMove);
        containerRef.current.removeEventListener('touchend', onPointerUp);
      }
      
      if (containerRef.current && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          console.error('Error removing canvas:', e);
        }
      }
      // Dispose geometries and materials
      bubbles.forEach(bubble => {
        bubble.mesh.geometry.dispose();
        if (Array.isArray(bubble.mesh.material)) {
          bubble.mesh.material.forEach(mat => mat.dispose());
        } else {
          bubble.mesh.material.dispose();
        }
        scene.remove(bubble.mesh);
        
        // Dispose text sprite
        if (bubble.textSprite) {
          if (bubble.textSprite.material instanceof THREE.SpriteMaterial) {
            bubble.textSprite.material.map?.dispose();
            bubble.textSprite.material.dispose();
          }
          scene.remove(bubble.textSprite);
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="emotion-bubble-page">
      <BackButton />
      <div ref={containerRef} className="bubble-canvas" />
      
      {/* Modal for showing entries */}
      {selectedEntries.length > 0 && selectedEmotion && (
        <div className="entries-modal" onClick={() => {
          setSelectedEntries([]);
          setSelectedEmotion(null);
        }}>
          <div className="entries-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="entries-modal-header">
              <h2 className="entries-modal-title">
                {selectedEmotion} Entries
              </h2>
              <button 
                className="entries-modal-close"
                onClick={() => {
                  setSelectedEntries([]);
                  setSelectedEmotion(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className="entries-modal-list">
              {selectedEntries.length === 0 ? (
                <p className="entries-empty">No entries found for this emotion.</p>
              ) : (
                selectedEntries.map(entry => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
