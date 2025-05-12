import { DisplayInformation, useDisplayClient } from '@/components/display-client';
import { capitalize } from '@/utils/capitalize';

export function DisplayControllers({ displayInformation }: { displayInformation: DisplayInformation }) {
  const { users } = useDisplayClient();
  const controllers = users.filter(u => u.username.startsWith('c/' + displayInformation.id + '/'));
  if (controllers.length === 0) {
    return <p>No controllers connected</p>;
  }
  return <>
    <p>Controllers</p>
    <div className='flex flex-wrap gap-2'>
      {controllers.map((user) => <div
        className={`flex gap-2 px-2 py-0.5 border rounded ${user.isLinked ? 'bg-green-200' : 'bg-red-200 opacity-50'}`}
        key={user.username}
      >
        <p>
          {capitalize(user.username.replace('c/' + displayInformation.id + '/', ''))}
          <span className='text-sm align-middle'>{user.isLinked ? ' 🟢' : ' 🔴'}</span>
        </p>
      </div>)}
    </div>
  </>;
}
