import { createServer, Props } from '@krmx/server';

const props: Props = { /* configure here */ }
const server = createServer(props);

server.on('join', (username) => {
  console.debug(`[debug] [my-app] ${username} joined!`);
});
server.on('message', (username, message) => {
  console.debug(`[debug] [my-app] ${username} sent ${message.type}`);
});

server.listen(8082);
