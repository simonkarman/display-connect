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
    <ul>
      {controllers.map((user) => <li
        key={user.username}
        className="list-disc ml-4"
      >
        <div className="flex gap-2">
          <p>{capitalize(user.username.replace('c/' + displayInformation.id + '/', ''))} {user.isLinked ? '🟢' : '🔴'}</p>
        </div>
      </li>)}
    </ul>
  </>;
}
