import { useEffect, useState } from 'react';
import { createClient } from '@krmx/client-react';
import { Controller } from '@/components/controller';

export const { client: controllerClient, useClient: useControllerClient } = createClient();

const useLocalState = (key: string, initialValue: string) => {
  const [value, setValue] = useState(() => {
    let storedValue: string | null | undefined;
    try {
      storedValue = localStorage?.getItem(key);
    } catch {
      storedValue = null;
    }
    return storedValue ? storedValue : initialValue;
  });

  return [value, (v: string) => {
    try {
      localStorage?.setItem(key, v);
    } catch {}
    setValue(v);
  }] as const;
}

export function ControllerClient({ serverUrl, displayId }: { serverUrl: string, displayId: string }) {
  const { status } = useControllerClient();
  const [username, setUsername] = useLocalState('username', '');
  const [clickedToLink, setClickedToLink] = useState<boolean>(false);

  useEffect(() => {
    if (status === 'initializing') {
      controllerClient.connect(serverUrl)
        .catch((e: Error) => console.error('error connecting:', e.message));
    }
    if (status === 'connected' && clickedToLink) {
      controllerClient.disconnect()
        .catch((e: Error) => console.error('error disconnecting:', e.message));
    }
  }, [status]);

  if (status === 'connected') {
    return <div className='flex flex-col items-center gap-2 mt-8'>
      <h1 className='font-bold text-2xl'>Hello!</h1>
      <p>You're trying to access display {displayId}</p>
      <p>What is your name?</p>
      <form action={() => {
        setClickedToLink(true);
        controllerClient.link('c/' + displayId + '/' + username)
          .catch((e: Error) => console.error('error linking:', e.message));
      }}>
        <input
          className='bg-white border p-1 rounded-l'
          type='text'
          placeholder='Enter your username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className='p-1 border bg-white rounded-r'
          disabled={username.length < 2} type='submit'
        >Link!</button>
      </form>
    </div>
  }
  if (status === 'linked') {
    return <Controller username={username} displayId={displayId} />;
  }
  if (status === 'closed') {
    return <p className='p-2'>Display closed</p>;
  }
  return <p className='p-2'>Connecting to {displayId} as {username}...</p>;
}
