import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function SuspenseBoundary() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
} 