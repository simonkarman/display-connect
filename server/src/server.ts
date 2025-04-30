import './json-logging';
import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer } from '@krmx/server';
import { enableUnlinkedKicker} from './unlinked-kicker';
import { LogSeverity } from '@krmx/base/dist/src/log';

// get version from package.json
const version = require('../package.json').version;

const app = express();
const httpServer = createHttpServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _, next) => {
  console.debug(`[debug] [http] ${req.ip} ${req.method} ${req.path}`);
  next();
})
app.get('/', (_, res) => {
  res.send({ message: 'Hello World!', version });
});
const server = createServer({
  http: { server: httpServer, path: 'krmx', queryParams: { 'version': version } },
  logger: (_severity: LogSeverity, ...args: unknown[]) => {
    const severity = _severity === 'info' ? 'debug' : _severity;
    console[severity](`[${severity}] [server]`, ...args);
  },
  isValidUsername(username: string) {
    return /^d\/[0-9]{12}$/.test(username) // Display: d/123456789012
      || /^c\/[0-9]{12}\/[a-zA-Z0-9](?!.*[._@-]{2})[a-zA-Z0-9._@-]{0,30}[a-zA-Z0-9]$/.test(username); // Controller: c/123456789012/abc
  }
});
enableUnlinkedKicker(server, {
  inactivitySeconds: 7,
  logger: message => console.info(`[info] [unlinked-kicker] ${message}`),
});

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
  private linked = false;
  constructor(
    public readonly id: string,
    public readonly width: number,
    public readonly height: number,
  ) {}

  getUsername() {
    return 'd/' + this.id;
  }

  markAsUnlinked() {
    this.linked = false;
  }

  markAsLinked() {
    this.linked = true;
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

    this.logControllers();
  }

  deleteController(controllerId: string) {
    const controller = this.controllers[controllerId];
    if (controller) {
      delete this.controllers[controllerId];
      if (this.linked) {
        server.send(this.getUsername(), {
          type: 'delete',
          controllerId,
        });
      }
      this.logControllers();
    }
  }

  private logControllers = () => {
    // Log the amount of controllers on the display
    const controllerNames = Object.keys(this.controllers);
    console.info(`[info] [display-connect] ${this.getUsername()} has ${controllerNames.length} controller(s):`, controllerNames);
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
    if (controller && this.linked) {
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
  const { isController, displayId } = extract(username);
  if (isController && displays[displayId] === undefined) {
    reject('display not found');
  }
});

server.on('join', (username) => {
  const { isDisplay, displayId, controllerId } = extract(username);

  if (isDisplay) {
    displays[displayId] = new Display(displayId, 11, 11);
    console.info(`[info] [display-connect] display ${username} created`);
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

server.on('link', (username) => {
  const { isDisplay, displayId } = extract(username);
  if (isDisplay) {
    displays[displayId]?.markAsLinked();
  }
});

server.on('unlink', (username) => {
  const { isDisplay, displayId } = extract(username);
  if (isDisplay) {
    displays[displayId]?.markAsUnlinked();
  }
});

server.on('leave', (username) => {
  const { isDisplay, displayId, controllerId } = extract(username);
  const display = displays[displayId]
  if (isDisplay) {
    display?.markAsUnlinked();
    display?.getControllerUsernames().forEach(u => server.kick(u))
    delete displays[displayId];
    console.info(`[info] [display-connect] display ${username} deleted`);
  } else {
    display?.deleteController(controllerId);
  }
});

server.on('message', (username, message) => {
  const { isController, displayId, controllerId } = extract(username);
  if (isController && message.type === 'move' && typeof message.payload === 'string') {
    const direction = message.payload;
    console.debug(`[debug] [display-connect] ${username} moved ${direction}`);
    displays[displayId]?.moveController(controllerId, direction);
  } else {
    console.warn(`[warn] [display-connect] ${username} sent unknown ${message.type} message`);
  }
});

server.listen(8082);
