import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

export interface HouseParams {
  stories: number;
  width: number;
  depth: number;
  style: "modern" | "colonial" | "mediterranean" | "minimalist" | "luxury";
  roofType: "flat" | "gable" | "hip";
  hasPool: boolean;
  hasGarage: boolean;
  hasBalcony: boolean;
  hasTerrace: boolean;
  colorScheme: {
    walls: string;
    accent: string;
    roof: string;
    trim: string;
  };
}

export const defaultHouseParams: HouseParams = {
  stories: 2,
  width: 12,
  depth: 10,
  style: "modern",
  roofType: "flat",
  hasPool: true,
  hasGarage: true,
  hasBalcony: true,
  hasTerrace: true,
  colorScheme: {
    walls: "#f5f0e8",
    accent: "#4a4a3a",
    roof: "#3d3d2d",
    trim: "#8b7355",
  },
};

function MainStructure({ params }: { params: HouseParams }) {
  const storyHeight = 3.2;
  const totalHeight = params.stories * storyHeight;

  return (
    <group>
      {/* Main building body */}
      {Array.from({ length: params.stories }).map((_, i) => (
        <group key={i} position={[0, i * storyHeight + storyHeight / 2, 0]}>
          {/* Wall */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[params.width, storyHeight, params.depth]} />
            <meshStandardMaterial color={params.colorScheme.walls} roughness={0.8} />
          </mesh>

          {/* Windows - front */}
          {Array.from({ length: Math.floor(params.width / 3) }).map((_, wi) => (
            <mesh
              key={`fw-${wi}`}
              position={[
                -params.width / 2 + 2 + wi * 3,
                0.2,
                params.depth / 2 + 0.01,
              ]}
            >
              <boxGeometry args={[1.8, 2, 0.1]} />
              <meshStandardMaterial
                color="#87CEEB"
                transparent
                opacity={0.5}
                metalness={0.8}
                roughness={0.1}
              />
            </mesh>
          ))}

          {/* Windows - back */}
          {Array.from({ length: Math.floor(params.width / 3) }).map((_, wi) => (
            <mesh
              key={`bw-${wi}`}
              position={[
                -params.width / 2 + 2 + wi * 3,
                0.2,
                -params.depth / 2 - 0.01,
              ]}
            >
              <boxGeometry args={[1.8, 2, 0.1]} />
              <meshStandardMaterial
                color="#87CEEB"
                transparent
                opacity={0.5}
                metalness={0.8}
                roughness={0.1}
              />
            </mesh>
          ))}

          {/* Floor slab line */}
          <mesh position={[0, -storyHeight / 2, 0]}>
            <boxGeometry args={[params.width + 0.3, 0.15, params.depth + 0.3]} />
            <meshStandardMaterial color={params.colorScheme.trim} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Roof */}
      {params.roofType === "flat" ? (
        <group position={[0, totalHeight + 0.15, 0]}>
          {/* Flat roof overhang */}
          <mesh castShadow>
            <boxGeometry args={[params.width + 2, 0.3, params.depth + 2]} />
            <meshStandardMaterial color={params.colorScheme.roof} roughness={0.4} />
          </mesh>
          {/* Roof accent element */}
          <mesh position={[params.width / 4, 0.5, 0]} castShadow>
            <boxGeometry args={[params.width / 2, 0.8, params.depth / 1.5]} />
            <meshStandardMaterial color={params.colorScheme.accent} roughness={0.5} />
          </mesh>
        </group>
      ) : params.roofType === "gable" ? (
        <group position={[0, totalHeight, 0]}>
          <mesh castShadow rotation={[0, 0, 0]}>
            <coneGeometry args={[params.width / 1.4, 3, 4]} />
            <meshStandardMaterial color={params.colorScheme.roof} roughness={0.7} />
          </mesh>
        </group>
      ) : (
        <group position={[0, totalHeight, 0]}>
          <mesh castShadow>
            <coneGeometry args={[params.width / 1.2, 2.5, 4]} />
            <meshStandardMaterial color={params.colorScheme.roof} roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* Front door */}
      <mesh position={[0, 1.2, params.depth / 2 + 0.02]}>
        <boxGeometry args={[2, 2.4, 0.1]} />
        <meshStandardMaterial color={params.colorScheme.accent} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Balcony({ params }: { params: HouseParams }) {
  if (!params.hasBalcony || params.stories < 2) return null;
  const storyHeight = 3.2;

  return (
    <group position={[0, storyHeight, params.depth / 2 + 1.5]}>
      {/* Balcony floor */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[params.width * 0.6, 0.15, 3]} />
        <meshStandardMaterial color={params.colorScheme.trim} roughness={0.6} />
      </mesh>
      {/* Glass railing */}
      <mesh position={[0, 0.5, 1.4]}>
        <boxGeometry args={[params.width * 0.6, 1, 0.05]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Railing posts */}
      {[-params.width * 0.3, params.width * 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.5, 1.4]}>
          <boxGeometry args={[0.05, 1, 0.05]} />
          <meshStandardMaterial color="#aaa" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Terrace({ params }: { params: HouseParams }) {
  if (!params.hasTerrace) return null;

  return (
    <group position={[0, 0.05, params.depth / 2 + 3]}>
      {/* Deck */}
      <mesh receiveShadow>
        <boxGeometry args={[params.width + 2, 0.1, 5]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
      </mesh>
      {/* Deck lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.06, -2 + i * 0.65]} receiveShadow>
          <boxGeometry args={[params.width + 2, 0.01, 0.05]} />
          <meshStandardMaterial color="#6B4226" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Pool({ params }: { params: HouseParams }) {
  if (!params.hasPool) return null;

  return (
    <group position={[0, -0.3, params.depth / 2 + 8]}>
      {/* Pool border */}
      <mesh receiveShadow>
        <boxGeometry args={[6, 0.4, 3.5]} />
        <meshStandardMaterial color="#d4c9b8" roughness={0.5} />
      </mesh>
      {/* Pool water */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[5.4, 0.2, 2.9]} />
        <meshStandardMaterial color="#4da6c9" transparent opacity={0.7} metalness={0.3} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Garage({ params }: { params: HouseParams }) {
  if (!params.hasGarage) return null;

  return (
    <group position={[-params.width / 2 - 3, 1.5, 0]}>
      {/* Garage structure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 3, params.depth * 0.6]} />
        <meshStandardMaterial color={params.colorScheme.walls} roughness={0.8} />
      </mesh>
      {/* Garage door */}
      <mesh position={[0, -0.3, params.depth * 0.3 + 0.01]}>
        <boxGeometry args={[3.5, 2.4, 0.1]} />
        <meshStandardMaterial color={params.colorScheme.accent} roughness={0.4} />
      </mesh>
      {/* Garage roof */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[5.5, 0.2, params.depth * 0.6 + 0.5]} />
        <meshStandardMaterial color={params.colorScheme.roof} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Landscaping({ params }: { params: HouseParams }) {
  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#5a8a3c" roughness={0.9} />
      </mesh>

      {/* Driveway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, params.depth / 2 + 15]}>
        <planeGeometry args={[4, 20]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>

      {/* Bushes/trees */}
      {[
        [params.width / 2 + 2, 0.8, 3],
        [params.width / 2 + 2, 0.8, -3],
        [-params.width / 2 - 7, 0.8, 3],
        [-params.width / 2 - 7, 0.8, -3],
        [params.width / 2 + 3, 2.5, 0],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[y > 1.5 ? 1.8 : 0.8, 8, 8]} />
          <meshStandardMaterial color={y > 1.5 ? "#2d6b1e" : "#3d8b2e"} roughness={0.9} />
        </mesh>
      ))}

      {/* Tree trunk */}
      <mesh position={[params.width / 2 + 3, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.5, 6]} />
        <meshStandardMaterial color="#5c3a1a" roughness={0.9} />
      </mesh>
    </group>
  );
}

function HouseScene({ params }: { params: HouseParams }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <MainStructure params={params} />
      <Balcony params={params} />
      <Terrace params={params} />
      <Pool params={params} />
      <Garage params={params} />
      <Landscaping params={params} />
    </group>
  );
}

export default function HouseModel3D({ params }: { params: HouseParams }) {
  const cameraDistance = Math.max(params.width, params.depth) * 1.5;

  return (
    <div className="w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100">
      <Canvas
        shadows
        camera={{
          position: [cameraDistance, cameraDistance * 0.6, cameraDistance],
          fov: 45,
          near: 0.1,
          far: 200,
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[15, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-10, 10, -5]} intensity={0.3} />
        <HouseScene params={params} />
        <ContactShadows position={[0, -0.04, 0]} opacity={0.4} scale={60} blur={2} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={5}
          maxDistance={60}
          maxPolarAngle={Math.PI / 2.1}
        />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
