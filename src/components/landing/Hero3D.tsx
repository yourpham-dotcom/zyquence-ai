import { Component, Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function Core() {
  const wireRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (wireRef.current) wireRef.current.rotation.y -= delta * 0.08;
    if (innerRef.current) innerRef.current.rotation.y += delta * 0.12;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={wireRef} scale={1.35}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.12} />
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
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 1.8, 0.4, 0]}>
        <torusGeometry args={[3.1, 0.004, 16, 100]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
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
