import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BackButton } from '../components/BackButton';
import { MOODS, type JournalEntry, type Mood } from '../types';
import './EmotionBubble.css';

interface EmotionNode {
  mesh: THREE.Mesh;
  labelMesh?: THREE.Sprite;
  mood: Mood;
  entryCount: number;
  entries: JournalEntry[];
  position: THREE.Vector3;
}

interface AttributeNode {
  mesh: THREE.Mesh;
  labelMesh?: THREE.Sprite;
  text: string;
  position: THREE.Vector3;
  parentNode: EmotionNode;
}

export function EmotionBubble() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const emotionNodesRef = useRef<EmotionNode[]>([]);
  const attributeNodesRef = useRef<AttributeNode[]>([]);
  const linesRef = useRef<THREE.Line[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<{ mood: Mood; entries: JournalEntry[] } | null>(null);
  const raycasterRef = useRef<THREE.Raycaster | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

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

  // Create text sprite (simple approach)
  const createTextSprite = (text: string, color: string = '#ffffff', size: number = 0.5) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = `bold ${size * 40}px Arial`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size * 2, size, 1);
    
    return sprite;
  };

  // Create mind map
  const createMindMap = (scene: THREE.Scene) => {
    // Clear existing nodes
    emotionNodesRef.current.forEach(node => {
      scene.remove(node.mesh);
      if (node.labelMesh) scene.remove(node.labelMesh);
      node.mesh.geometry.dispose();
      if (Array.isArray(node.mesh.material)) {
        node.mesh.material.forEach(mat => mat.dispose());
      } else {
        node.mesh.material.dispose();
      }
    });
    attributeNodesRef.current.forEach(node => {
      scene.remove(node.mesh);
      if (node.labelMesh) scene.remove(node.labelMesh);
      node.mesh.geometry.dispose();
      if (Array.isArray(node.mesh.material)) {
        node.mesh.material.forEach(mat => mat.dispose());
      } else {
        node.mesh.material.dispose();
      }
    });
    linesRef.current.forEach(line => {
      scene.remove(line);
      line.geometry.dispose();
      if (Array.isArray(line.material)) {
        line.material.forEach(mat => mat.dispose());
      } else {
        line.material.dispose();
      }
    });

    emotionNodesRef.current = [];
    attributeNodesRef.current = [];
    linesRef.current = [];

    // Group entries by mood
    const moodGroups = new Map<string, JournalEntry[]>();
    entries.forEach(entry => {
      const moodId = entry.mood.id;
      if (!moodGroups.has(moodId)) {
        moodGroups.set(moodId, []);
      }
      moodGroups.get(moodId)!.push(entry);
    });

    // Create central node
    const centerGeometry = new THREE.SphereGeometry(2, 32, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.3,
    });
    const centerNode = new THREE.Mesh(centerGeometry, centerMaterial);
    centerNode.position.set(0, 0, 0);
    scene.add(centerNode);

    // Add center label
    const centerLabel = createTextSprite('YOUR EMOTIONS', '#000000', 0.6);
    if (centerLabel) {
      centerLabel.position.set(0, -3, 0);
      scene.add(centerLabel);
    }

    // Create emotion nodes in a circle around center
    const totalMoods = MOODS.length;
    const radius = 12; // Distance from center

    MOODS.forEach((mood, index) => {
      const moodEntries = moodGroups.get(mood.id) || [];
      const entryCount = moodEntries.length;

      // Calculate angle for circular positioning
      const angle = (index / totalMoods) * Math.PI * 2;

      // Position emotion node
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;

      // Calculate bubble size based on entry count
      const baseSize = 1.5;
      const maxSize = 4.0;
      const maxCount = Math.max(...Array.from(moodGroups.values()).map(g => g.length), 1);
      const size = entryCount > 0 
        ? baseSize + (entryCount / maxCount) * (maxSize - baseSize)
        : baseSize;

      // Create emotion bubble
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const color = new THREE.Color(mood.color);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
        emissive: color,
        emissiveIntensity: 0.6,
        shininess: 100,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      scene.add(mesh);

      // Add emotion label
      const label = createTextSprite(mood.name.toUpperCase(), mood.color, 0.4);
      if (label) {
        label.position.set(x, y - size - 1, z);
        scene.add(label);
      }

      // Create line from center to emotion node
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.5,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
      linesRef.current.push(line);

      // Store emotion node
      const emotionNode: EmotionNode = {
        mesh,
        labelMesh: label ? label : undefined,
        mood,
        entryCount,
        entries: moodEntries,
        position: new THREE.Vector3(x, y, z),
      };
      emotionNodesRef.current.push(emotionNode);

      // Create attribute nodes for each emotion
      const attributes: string[] = [];
      
      if (entryCount > 0) {
        attributes.push(`${entryCount} ENTRIES`);
      }
      
      if (entryCount >= 10) {
        attributes.push('ACTIVE');
      } else if (entryCount > 0) {
        attributes.push('GROWING');
      } else {
        attributes.push('READY');
      }

      // Position attribute nodes around each emotion node
      attributes.forEach((attr, attrIndex) => {
        const attrAngle = angle + (attrIndex - attributes.length / 2 + 0.5) * 0.3;
        const attrRadius = size + 2.5;
        const attrX = Math.cos(attrAngle) * attrRadius + x;
        const attrY = Math.sin(attrAngle) * attrRadius + y;
        const attrZ = z;

        // Create small attribute bubble
        const attrGeometry = new THREE.SphereGeometry(0.8, 16, 16);
        const attrColor = new THREE.Color(mood.color);
        attrColor.multiplyScalar(0.7); // Lighter shade
        const attrMaterial = new THREE.MeshPhongMaterial({
          color: attrColor,
          transparent: true,
          opacity: 0.8,
          emissive: attrColor,
          emissiveIntensity: 0.4,
        });

        const attrMesh = new THREE.Mesh(attrGeometry, attrMaterial);
        attrMesh.position.set(attrX, attrY, attrZ);
        scene.add(attrMesh);

        // Add attribute label
        const attrLabel = createTextSprite(attr, mood.color, 0.25);
        if (attrLabel) {
          attrLabel.position.set(attrX, attrY - 1.2, attrZ);
          scene.add(attrLabel);
        }

        // Create line from emotion to attribute
        const attrLineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(attrX, attrY, attrZ)
        ]);
        const attrLineMaterial = new THREE.LineBasicMaterial({
          color: new THREE.Color(mood.color),
          transparent: true,
          opacity: 0.3,
        });
        const attrLine = new THREE.Line(attrLineGeometry, attrLineMaterial);
        scene.add(attrLine);
        linesRef.current.push(attrLine);

        // Store attribute node
        const attributeNode: AttributeNode = {
          mesh: attrMesh,
          labelMesh: attrLabel ? attrLabel : undefined,
          text: attr,
          position: new THREE.Vector3(attrX, attrY, attrZ),
          parentNode: emotionNode,
        };
        attributeNodesRef.current.push(attributeNode);
      });
    });

    console.log('Mind map created with', emotionNodesRef.current.length, 'emotion nodes');
  };

  // Main scene setup
  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Setting up mind map scene...');

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // White background like the example
    sceneRef.current = scene;

    // Camera setup - top-down view for mind map
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 35); // Looking down at the mind map
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting - bright and even for mind map
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 0, 20);
    scene.add(directionalLight);

    // Create mind map
    createMindMap(scene);

    // Click handler
    const handleClick = (event: MouseEvent) => {
      if (!cameraRef.current) return;
      
      if (!raycasterRef.current) {
        raycasterRef.current = new THREE.Raycaster();
      }

      const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      
      // Check emotion nodes first
      const emotionIntersects = raycasterRef.current.intersectObjects(
        emotionNodesRef.current.map(n => n.mesh)
      );

      if (emotionIntersects.length > 0) {
        const clickedNode = emotionNodesRef.current.find(
          n => n.mesh === emotionIntersects[0].object
        );
        if (clickedNode) {
          setSelectedMood({ mood: clickedNode.mood, entries: clickedNode.entries });
        }
        return;
      }

      // Check attribute nodes
      const attrIntersects = raycasterRef.current.intersectObjects(
        attributeNodesRef.current.map(n => n.mesh)
      );

      if (attrIntersects.length > 0) {
        const clickedAttr = attributeNodesRef.current.find(
          n => n.mesh === attrIntersects[0].object
        );
        if (clickedAttr) {
          setSelectedMood({ 
            mood: clickedAttr.parentNode.mood, 
            entries: clickedAttr.parentNode.entries 
          });
        }
      }
    };

    window.addEventListener('click', handleClick);

    // Animation loop - gentle floating animation
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Gentle floating animation for emotion nodes
      emotionNodesRef.current.forEach((node, index) => {
        const floatAmount = Math.sin(time * 0.5 + index) * 0.1;
        node.mesh.position.y = node.position.y + floatAmount;
        
        // Gentle rotation
        node.mesh.rotation.y += 0.01;
      });

      // Gentle floating for attribute nodes
      attributeNodesRef.current.forEach((node, index) => {
        const floatAmount = Math.sin(time * 0.7 + index * 0.5) * 0.05;
        node.mesh.position.y = node.position.y + floatAmount;
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleClick);
      if (containerRef.current && renderer.domElement) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch (e) {
          console.error('Error removing canvas:', e);
        }
      }
      renderer.dispose();
    };
  }, []);

  // Update mind map when entries change
  useEffect(() => {
    if (sceneRef.current) {
      createMindMap(sceneRef.current);
    }
  }, [entries]);

  return (
    <div className="emotion-bubble-page">
      <BackButton />

      <div ref={containerRef} className="bubble-canvas" />

      <div className="bubble-hint">
        <p>Your Emotion Mind Map</p>
        <p className="bubble-subhint">
          {entries.length > 0 
            ? 'Click an emotion bubble to see your entries • Bubbles grow with more entries'
            : 'Create journal entries to build your emotion mind map • Each emotion connects to your experiences'}
        </p>
      </div>

      {selectedMood && (
        <div className="bubble-detail-modal" onClick={() => setSelectedMood(null)}>
          <div className="bubble-detail-content" onClick={(e) => e.stopPropagation()}>
            <button className="bubble-close" onClick={() => setSelectedMood(null)}>
              ✕
            </button>
            <div
              className="bubble-detail-mood"
              style={{
                background: `linear-gradient(135deg, ${selectedMood.mood.color}80 0%, ${selectedMood.mood.color}40 100%)`,
                borderColor: selectedMood.mood.color,
              }}
            >
              <span className="bubble-detail-emoji">{selectedMood.mood.emoji}</span>
            </div>
            <div className="bubble-detail-header">
              <h3 className="bubble-mood-name">{selectedMood.mood.name}</h3>
              <p className="bubble-entry-count">{selectedMood.entries.length} {selectedMood.entries.length === 1 ? 'entry' : 'entries'}</p>
            </div>
            <div className="bubble-entries-list">
              {selectedMood.entries.map((entry) => (
                <div key={entry.id} className="bubble-entry-item">
                  <div className="bubble-entry-text">
                    {entry.content.length > 150 ? `${entry.content.substring(0, 150)}...` : entry.content}
                  </div>
                  <div className="bubble-entry-date">
                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
