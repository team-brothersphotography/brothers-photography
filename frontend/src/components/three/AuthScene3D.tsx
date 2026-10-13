import { lazy, Suspense } from "react";

// Three.js/R3F are only needed on the auth screens, so they're code-split
// into their own chunk instead of bloating the main bundle for every page.
const AuthScene3DImpl = lazy(() => import("./AuthScene3DImpl"));

export default function AuthScene3D() {
  return (
    <Suspense fallback={<div className="absolute inset-0 -z-10" />}>
      <AuthScene3DImpl />
    </Suspense>
  );
}
