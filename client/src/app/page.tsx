"use client";
import { useSearchParams } from 'next/navigation'
import { DisplayClient } from '@/components/display-client';
import { ControllerClient } from '@/components/controller-client';

export default function MyApp() {
  const serverUrl = process.env.NEXT_PUBLIC_KRMX_SERVER_URL || `ws://localhost:8082/krmx?version=0.1.0`;
  const displayId = useSearchParams().get("d");

  return (displayId == null)
    ? <DisplayClient serverUrl={serverUrl} />
    : <ControllerClient serverUrl={serverUrl} displayId={displayId} />;
}
