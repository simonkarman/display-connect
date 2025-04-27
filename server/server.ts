import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer } from '@krmx/server';
import { enableUnlinkedKicker} from './unlinked-kicker';

const app = express();
const httpServer = createHttpServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.send({ message: 'Hello World!' });
});

const server = createServer({
  http: { server: httpServer, path: 'krmx' },
  isValidUsername(username: string) {
    return /^d\/[0-9]{12}$/.test(username) // Display: d/123456789012
      || /^c\/[0-9]{12}\/[a-zA-Z0-9](?!.*[._@-]{2})[a-zA-Z0-9._@-]{0,30}[a-zA-Z0-9]$/.test(username); // Controller: c/123456789012/abc
  }
});
enableUnlinkedKicker(server, { inactivitySeconds: 15 });

const extract = (username: string) => {
  return {
    isDisplay: username.startsWith('d/'),
    isController: username.startsWith('c/'),
    displayId: username.slice(2, 14),
    controllerId: username.slice(15),
  }
};

interface Controller {
  x: number;
  y: number;
}
class Display {
  private readonly controllers: Record<string, Controller | undefined> = {};
  constructor(
    public readonly id: string,
    public readonly width: number,
    public readonly height: number,
  ) {}

  getUsername() {
    return 'd/' + this.id;
  }

  getControllerUsernames() {
    return Object.keys(this.controllers).map((controllerId) => 'c/' + this.id + '/' + controllerId);
  }

  addController(controllerId: string) {
    this.controllers[controllerId] = {
      x: Math.floor(this.width / 2),
      y: Math.floor(this.height / 2),
    };
    this.forwardLocation(controllerId);
  }

  deleteController(controllerId: string) {
    const controller = this.controllers[controllerId];
    if (controller) {
      delete this.controllers[controllerId];
      server.send(this.getUsername(), {
        type: 'delete',
        controllerId,
      });
    }
  }

  moveController(controllerId: string, direction: string) {
    const controller = this.controllers[controllerId];
    if (controller) {
      switch (direction) {
        case 'up':
          controller.y -= 1;
          break;
        case 'down':
          controller.y += 1;
          break;
        case 'left':
          controller.x -= 1;
          break;
        case 'right':
          controller.x += 1;
          break;
      }
      this.clampControllerPosition(controllerId);
      this.forwardLocation(controllerId);
    }
  }

  clampControllerPosition(controllerId: string) {
    const controller = this.controllers[controllerId];
    if (controller) {
      controller.x = Math.max(0, Math.min(controller.x, this.width - 1));
      controller.y = Math.max(0, Math.min(controller.y, this.height - 1));
    }
  }

  forwardLocation(controllerId: string) {
    const controller = this.controllers[controllerId];
    if (controller) {
      server.send(this.getUsername(), {
        type: 'location',
        controllerId,
        x: controller.x,
        y: controller.y,
      });
    }
  }
}
const displays: Record<string, Display | undefined> = {};

server.on('authenticate', (username, info, reject) => {
  const { isController, displayId, controllerId } = extract(username);
  if (isController && displays[displayId] === undefined) {
    reject('display not found');
  }
});

server.on('join', (username) => {
  const { isDisplay, displayId, controllerId } = extract(username);

  if (isDisplay) {
    displays[displayId] = new Display(displayId, 11, 11);
  } else {
    const display = displays[displayId];
    if (display) {
      display.addController(controllerId);
    } else {
      console.warn(`[warn] [display-connect] ${username} tried to join a display that doesn't exist`);
      server.kick(username);
    }
  }
});

server.on('leave', (username) => {
  const { isDisplay, displayId, controllerId } = extract(username);
  const display = displays[displayId]
  if (isDisplay) {
    for (let controllerUsernames in display?.getControllerUsernames()) {
      server.kick(controllerUsernames);
    }
    delete displays[displayId];
  } else {
    display?.deleteController(controllerId);
  }
});

server.on('message', (username, message) => {
  const { isController, displayId, controllerId } = extract(username);
  console.debug(`[debug] [display-connect] ${username} sent ${message.type}`);
  if (isController && message.type === 'move' && typeof message.payload === 'string') {
    displays[displayId]?.moveController(controllerId, message.payload);
  }
});

server.listen(8082);
