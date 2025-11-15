import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { JournalEntry } from '../types';
import './SpatialJournalView.css';

interface SpatialJournalViewProps {
  entries: JournalEntry[];
  onEntryClick?: (entry: JournalEntry) => void;
}

export function SpatialJournalView({ entries, onEntryClick }: SpatialJournalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate all meshes slightly
      meshesRef.current.forEach((mesh) => {
        mesh.rotation.y += 0.005;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update meshes when entries change
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const currentMeshes = meshesRef.current;

    // Remove old meshes
    currentMeshes.forEach((mesh, id) => {
      if (!entries.find(e => e.id === id)) {
        scene.remove(mesh);
        currentMeshes.delete(id);
      }
    });

    // Add or update meshes
    entries.forEach((entry, index) => {
      if (!currentMeshes.has(entry.id)) {
        // Create new mesh for entry
        const geometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
        const material = new THREE.MeshPhongMaterial({
          color: entry.mood.color,
          transparent: true,
          opacity: 0.8,
          emissive: entry.mood.color,
          emissiveIntensity: 0.3,
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Position in a circular layout
        const angle = (index / entries.length) * Math.PI * 2;
        const radius = 3;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = Math.sin(angle) * radius;
        mesh.position.z = entry.position.z;

        scene.add(mesh);
        currentMeshes.set(entry.id, mesh);
      }
    });
  }, [entries]);

  return (
    <div ref={containerRef} className="spatial-journal-view">
      {entries.length === 0 && (
        <div className="empty-state">
          <p>Start journaling to see your thoughts in 3D space</p>
        </div>
      )}
    </div>
  );
}
