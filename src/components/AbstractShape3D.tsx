import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

const AbstractBlob = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.8, 64);
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.3;
    meshRef.current.rotation.y = t * 0.12;
    meshRef.current.rotation.z = Math.cos(t * 0.1) * 0.15;

    const positions = meshRef.current.geometry.attributes.position;
    const original = new THREE.IcosahedronGeometry(1.8, 64);
    const origPositions = original.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const ox = origPositions.getX(i);
      const oy = origPositions.getY(i);
      const oz = origPositions.getZ(i);

      const noise =
        Math.sin(ox * 2.0 + t * 0.6) * 0.12 +
        Math.sin(oy * 3.0 + t * 0.4) * 0.08 +
        Math.cos(oz * 2.5 + t * 0.5) * 0.1 +
        Math.sin((ox + oy) * 1.5 + t * 0.3) * 0.06;

      const scale = 1 + noise;
      positions.setXYZ(i, ox * scale, oy * scale, oz * scale);
    }

    positions.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    original.dispose();
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <mesh ref={meshRef} geometry={geometry} scale={1}>
        <MeshTransmissionMaterial
          ref={materialRef}
          backside
          samples={6}
          thickness={0.5}
          chromaticAberration={0.3}
          anisotropy={0.3}
          distortion={0.4}
          distortionScale={0.5}
          temporalDistortion={0.2}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color="#e8e8e8"
          transmission={0.95}
          roughness={0.05}
          ior={1.5}
        />
      </mesh>
    </Float>
  );
};

const FloatingRing = ({ radius, tubeRadius, speed, axis }: {
  radius: number;
  tubeRadius: number;
  speed: number;
  axis: "x" | "y" | "z";
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    if (axis === "x") ref.current.rotation.x = t * speed;
    if (axis === "y") ref.current.rotation.y = t * speed;
    if (axis === "z") ref.current.rotation.z = t * speed;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tubeRadius, 32, 100]} />
      <meshStandardMaterial
        color="#c0c0c0"
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.15}
      />
    </mesh>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-3, -2, -5]} intensity={0.4} color="#a0c4ff" />
      <pointLight position={[0, 3, 0]} intensity={0.6} color="#ffffff" />
      
      <AbstractBlob />
      
      <FloatingRing radius={2.8} tubeRadius={0.015} speed={0.15} axis="y" />
      <FloatingRing radius={3.2} tubeRadius={0.01} speed={-0.1} axis="x" />
      <FloatingRing radius={3.5} tubeRadius={0.008} speed={0.08} axis="z" />
      
      <Environment preset="city" />
    </>
  );
};

const AbstractShape3D = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default AbstractShape3D;
