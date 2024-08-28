import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

function Panel({ position, size, expanded, mouseX }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const panelSize = {
    width: expanded ? size.width * 1.5 : size.width,
    height: expanded ? size.height * 1.5 : size.height,
    depth: 0.12
  };

  useEffect(() => {
    if (meshRef.current) {
      const angleX = THREE.MathUtils.lerp(0, Math.PI / 12, Math.abs(mouseX));
      meshRef.current.rotation.y = mouseX > 0 ? angleX : -angleX;
    }
  }, [mouseX]);

  return (
    <RoundedBox
      ref={meshRef}
      position={position}
      args={[panelSize.width, panelSize.height, panelSize.depth]}
      radius={0.03}
      smoothness={4}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshPhysicalMaterial
        color={hovered ? '#555555' : '#444444'}
        metalness={0.5}
        roughness={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        reflectivity={1}
      />
    </RoundedBox>
  );
}

function Grid() {
  const [expandedPanel, setExpandedPanel] = useState(null);
  const [mouseX, setMouseX] = useState(0);

  const panels = [
    { id: 1, position: [-2, 1, 0], size: { width: 1, height: 1 } },
    { id: 2, position: [0, 1, 0], size: { width: 1, height: 1 } },
    { id: 3, position: [2, 1, 0], size: { width: 1, height: 1 } },
    { id: 4, position: [-2, -1, 0], size: { width: 1, height: 1 } },
    { id: 5, position: [0, -1, 0], size: { width: 1, height: 1 } },
    { id: 6, position: [2, -1, 0], size: { width: 1, height: 1 } },
  ];

  useFrame(({ mouse }) => {
    setMouseX(mouse.x);
  });

  return (
    <>
      {panels.map((panel) => (
        <Panel
          key={panel.id}
          position={panel.position}
          size={panel.size}
          expanded={expandedPanel === panel.id}
          mouseX={mouseX}
          onClick={() => setExpandedPanel(expandedPanel === panel.id ? null : panel.id)}
        />
      ))}
    </>
  );
}

function Scene() {
  const { camera } = useThree();
  const cameraRef = useRef();

  useEffect(() => {
    if (camera) {
      cameraRef.current = camera;
    }
  }, [camera]);

  useFrame(({ mouse }) => {
    if (cameraRef.current) {
      const rotationX = THREE.MathUtils.lerp(0, Math.PI / 24, Math.abs(mouse.y));
      const rotationY = THREE.MathUtils.lerp(0, Math.PI / 24, Math.abs(mouse.x));
      cameraRef.current.rotation.x = mouse.y > 0 ? rotationX : -rotationX;
      cameraRef.current.rotation.y = mouse.x > 0 ? -rotationY : rotationY;
    }
  });

  return (
    <>
      <color attach="background" args={['#222222']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />
      <Grid />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
