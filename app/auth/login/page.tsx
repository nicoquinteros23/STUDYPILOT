import dynamic from "next/dynamic";

const SuspenseBoundary = dynamic(() => import("./SuspenseBoundary"), { ssr: false });

export default function LoginPage() {
  return <SuspenseBoundary />;
} 