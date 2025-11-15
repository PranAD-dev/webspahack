import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BackButton } from '../components/BackButton';
import { MOODS, type JournalEntry } from '../types';
import './EmotionBubble.css';

interface BubbleData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  targetPosition: THREE.Vector3;
  floatOffset: number;
  entry: JournalEntry;
}

export function EmotionBubble() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const bubblesRef = useRef<BubbleData[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());

  // Load entries from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('journalEntries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const entriesWithDates = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          mood: MOODS.find(m => m.id === entry.mood.id) || entry.mood,
        }));
        setEntries(entriesWithDates);
      } catch (e) {
        console.error('Error loading entries:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.05);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 15;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Multiple point lights for better bubble illumination
    const pointLight1 = new THREE.PointLight(0xffffff, 1, 50);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x88ccff, 0.5, 50);
    pointLight2.position.set(-10, -10, 5);
    scene.add(pointLight2);

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Click handler
    const handleClick = (event: MouseEvent) => {
      if (!cameraRef.current) return;

      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(
        bubblesRef.current.map(b => b.mesh)
      );

      if (intersects.length > 0) {
        const clickedBubble = bubblesRef.current.find(
          b => b.mesh === intersects[0].object
        );
        if (clickedBubble) {
          setSelectedEntry(clickedBubble.entry);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Animation loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Update each bubble
      bubblesRef.current.forEach((bubble) => {
        const { mesh, velocity, targetPosition, floatOffset } = bubble;

        // Organic floating motion
        const floatY = Math.sin(time * 0.5 + floatOffset) * 0.02;
        const floatX = Math.cos(time * 0.3 + floatOffset) * 0.015;
        const floatZ = Math.sin(time * 0.4 + floatOffset * 1.5) * 0.01;

        // Smooth movement towards target
        velocity.x += (targetPosition.x - mesh.position.x) * 0.01;
        velocity.y += (targetPosition.y - mesh.position.y) * 0.01;
        velocity.z += (targetPosition.z - mesh.position.z) * 0.01;

        // Apply damping
        velocity.multiplyScalar(0.95);

        // Update position
        mesh.position.x += velocity.x + floatX;
        mesh.position.y += velocity.y + floatY;
        mesh.position.z += velocity.z + floatZ;

        // Gentle rotation
        mesh.rotation.x += delta * 0.1;
        mesh.rotation.y += delta * 0.15;

        // Pulsing effect
        const scale = 1 + Math.sin(time * 2 + floatOffset) * 0.05;
        mesh.scale.setScalar(scale);

        // Mouse interaction - bubbles drift away from cursor
        if (cameraRef.current) {
          const mouseVector = new THREE.Vector3(
            mouseRef.current.x * 10,
            mouseRef.current.y * 10,
            0
          );
          const distance = mesh.position.distanceTo(mouseVector);
          if (distance < 5) {
            const pushAway = mesh.position.clone().sub(mouseVector).normalize();
            mesh.position.add(pushAway.multiplyScalar(0.05));
          }
        }

        // Keep bubbles within bounds
        const maxDistance = 12;
        if (mesh.position.length() > maxDistance) {
          const normalized = mesh.position.clone().normalize();
          mesh.position.copy(normalized.multiplyScalar(maxDistance * 0.95));
        }
      });

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
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Create bubbles when entries change
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;

    // Clear existing bubbles
    bubblesRef.current.forEach(bubble => {
      scene.remove(bubble.mesh);
      bubble.mesh.geometry.dispose();
      if (Array.isArray(bubble.mesh.material)) {
        bubble.mesh.material.forEach(mat => mat.dispose());
      } else {
        bubble.mesh.material.dispose();
      }
    });
    bubblesRef.current = [];

    // Create new bubbles
    entries.forEach((entry, index) => {
      // Create sphere geometry (BUBBLE!)
      const geometry = new THREE.SphereGeometry(0.8, 32, 32);

      // Parse mood color
      const color = new THREE.Color(entry.mood.color);

      // Create glowing material
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        emissive: color,
        emissiveIntensity: 0.5,
        shininess: 100,
        specular: 0xffffff,
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Position bubbles in a scattered 3D layout
      const angle = (index / entries.length) * Math.PI * 2;
      const radiusVariation = 4 + Math.random() * 4;
      const heightVariation = (Math.random() - 0.5) * 6;

      mesh.position.x = Math.cos(angle) * radiusVariation;
      mesh.position.y = heightVariation;
      mesh.position.z = Math.sin(angle) * radiusVariation - 5;

      scene.add(mesh);

      // Store bubble data
      bubblesRef.current.push({
        mesh,
        velocity: new THREE.Vector3(0, 0, 0),
        targetPosition: mesh.position.clone(),
        floatOffset: Math.random() * Math.PI * 2,
        entry,
      });
    });
  }, [entries]);

  return (
    <div className="emotion-bubble-page">
      <BackButton />

      <div ref={containerRef} className="bubble-canvas" />

      {entries.length === 0 && (
        <div className="bubble-empty-state">
          <h2>No Emotions Yet</h2>
          <p>Create journal entries to see your emotions floating in space</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="bubble-hint">
          <p>Move your mouse to interact with the bubbles</p>
          <p className="bubble-subhint">Click a bubble to see its entry</p>
        </div>
      )}

      {selectedEntry && (
        <div className="bubble-detail-modal" onClick={() => setSelectedEntry(null)}>
          <div className="bubble-detail-content" onClick={(e) => e.stopPropagation()}>
            <button className="bubble-close" onClick={() => setSelectedEntry(null)}>
              ✕
            </button>
            <div
              className="bubble-detail-mood"
              style={{
                background: `linear-gradient(135deg, ${selectedEntry.mood.color}80 0%, ${selectedEntry.mood.color}40 100%)`,
                borderColor: selectedEntry.mood.color,
              }}
            >
              <span className="bubble-detail-emoji">{selectedEntry.mood.emoji}</span>
            </div>
            <div className="bubble-detail-text">
              {selectedEntry.content}
            </div>
            <div className="bubble-detail-date">
              {new Date(selectedEntry.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
