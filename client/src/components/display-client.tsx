"use client";

import { useEffect, useState } from 'react';
import { createClient, createStore } from '@krmx/client-react';
import { randomDigits } from '@/utils/random-digits';
import { Display } from '@/components/display';

export const { client: displayClient, useClient: useDisplayClient } = createClient();
export const useDisplayStore = createStore(
  displayClient,
  {} as Record<string, undefined | { x: number, y: number }>,
  (state, action) => {
    switch (action.type) {
      case 'location':
        const locationAction = action as { type: 'location', controllerId: string, x: number, y: number };
        return {
          ...state,
          [locationAction.controllerId]: {
            x: locationAction.x,
            y: locationAction.y,
          },
        };
      case 'delete':
        const deleteAction = action as { type: 'delete', controllerId: string };
        const newState = { ...state };
        delete newState[deleteAction.controllerId];
        return newState;
      default:
        return state;
    }
  },
  (s) => s,
)
export interface DisplayInformation {
  id: string;
}

export function DisplayClient({ serverUrl }: { serverUrl: string }) {
  const { status } = useDisplayClient();
  const [displayInformation, setDisplayInformation] = useState<undefined | DisplayInformation>(undefined);

  useEffect(() => {
    if (status === 'initializing' || status === 'closed') {
      displayClient.connect(serverUrl)
        .catch((e: Error) => console.error('error connecting:', e.message));
    }
    if (status === 'connected') {
      const id = randomDigits(12);
      setDisplayInformation({ id });
      displayClient.link('d/' + id)
        .catch((e: Error) => console.error('error linking:', e.message));
    }
  }, [status]);

  if (status === 'linked') {
    return <Display displayInformation={displayInformation!} />
  }
  return <p className='p-2'>Connecting...</p>;
}
