import { capitalize } from '@/utils/capitalize';
import { controllerClient } from '@/components/controller-client';

export function Controller({ username, displayId }: { username: string, displayId: string }) {
  const move = (direction: string) => {
    controllerClient.send({ type: 'move', payload: direction });
  }
  return <div className="flex flex-col items-center gap-2 mt-16">
    <h1 className="font-bold text-2xl">Hi, {capitalize(username)} 👋</h1>
    <p>You control {capitalize(username)} on display {displayId}!</p>
    <div className="mt-8 flex items-center flex-col">
      <button className='w-16 h-16 border rounded-2xl bg-white' onClick={() => move('up')}>Up</button>
      <div className="flex">
        <button className='w-16 h-16 border rounded-2xl bg-white' onClick={() => move('left')}>Left</button>
        <div className='w-16 h-16'>{''}</div>
        <button className='w-16 h-16 border rounded-2xl bg-white' onClick={() => move('right')}>Right</button>
      </div>
      <button className='w-16 h-16 border rounded-2xl bg-white' onClick={() => move('down')}>Down</button>
    </div>
  </div>;
}
