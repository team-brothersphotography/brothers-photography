import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh, Group } from "three";

/**
 * Decorative 3D background for the login/register/forgot-password screens:
 * a slowly rotating camera-aperture ring with drifting gold "bokeh"
 * spheres, rendered with react-three-fiber. Purely ambient - no
 * interaction required, kept lightweight (a handful of primitives).
 */
function ApertureRing() {
  const ringGroup = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ringGroup.current) {
      ringGroup.current.rotation.z += delta * 0.15;
      ringGroup.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.3;
    }
  });
  return (
    <group ref={ringGroup}>
      <mesh>
        <torusGeometry args={[1.6, 0.045, 16, 100]} />
        <meshStandardMaterial color="#c9a227" emissive="#8c6d46" emissiveIntensity={0.4} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.15, 0.03, 16, 100]} />
        <meshStandardMaterial color="#e4c773" emissive="#8c6d46" emissiveIntensity={0.3} metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Bokeh({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const mesh = useRef<Mesh>(null);
  const start = position[1];
  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.position.y = start + Math.sin(clock.getElapsedTime() * speed) * 0.4;
      mesh.current.rotation.y += 0.002;
    }
  });
  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshStandardMaterial color="#c9a227" transparent opacity={0.18} emissive="#c9a227" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function AuthScene3DImpl() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[3, 3, 4]} intensity={40} color="#e4c773" />
          <ApertureRing />
          <Bokeh position={[-2.6, 1.2, -1]} scale={0.35} speed={0.6} />
          <Bokeh position={[2.4, -1, -2]} scale={0.5} speed={0.4} />
          <Bokeh position={[1.8, 1.6, -1.5]} scale={0.25} speed={0.8} />
          <Bokeh position={[-2, -1.4, -1]} scale={0.3} speed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
