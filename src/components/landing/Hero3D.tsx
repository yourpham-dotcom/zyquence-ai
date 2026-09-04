import { Component, Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

function Core() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
    if (wireRef.current) wireRef.current.rotation.y -= delta * 0.08;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <MeshDistortMaterial
          color="#0a1a2a"
          emissive="#00d4ff"
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.9}
          distort={0.35}
          speed={1.5}
        />
      </mesh>
      <mesh ref={wireRef} scale={1.35}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#22e8ff" wireframe transparent opacity={0.25} />
      </mesh>
    </Float>
  );
}

function Rings() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.05;
  });
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.6, 0.006, 16, 100]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, 0.4, 0]}>
        <torusGeometry args={[3.1, 0.004, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// Canvas WebGL init can throw synchronously on devices/browsers without
// WebGL support — without this boundary that error unmounts the whole
// landing page instead of just the 3D decoration.
class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

const Hero3D = () => {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <WebGLBoundary>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 1.5]}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={1} color="#22e8ff" />
            <pointLight position={[-5, -3, -5]} intensity={0.6} color="#8b5cf6" />
            <Core />
            <Rings />
            <Stars radius={40} depth={20} count={1200} factor={2} saturation={0} fade speed={0.5} />
          </Suspense>
        </Canvas>
      </WebGLBoundary>
    </div>
  );
};

export default Hero3D;
