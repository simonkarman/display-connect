const originalConsole = {
  log: console.log,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error
};

type Severity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

function formatLog(...args: unknown[]) {
  // Handle multiple arguments by concatenating them
  const formattedArgs = args.map(arg => {
    if (Array.isArray(arg)) {
      // Handle arrays properly
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return '[Array]';
      }
    } else if (typeof arg === 'string') {
      return arg;
    } else if (arg instanceof Error) {
      return arg.stack || arg.message;
    } else if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return `[Object: ${typeof arg}]`;
      }
    } else {
      return String(arg);
    }
  });

  // Join all non-zero length arguments with spaces
  return formattedArgs.filter(s => s.length > 0).join(' ');
}

// Helper to detect severity from string prefixes
function detectSeverity(message: unknown): Severity | null {
  if (typeof message === 'string') {
    if (message.startsWith('[debug]')) return 'DEBUG';
    if (message.startsWith('[info]')) return 'INFO';
    if (message.startsWith('[warn]')) return 'WARNING';
    if (message.startsWith('[error]')) return 'ERROR';
  }
  return null;
}

// Create a general console method handler
function createConsoleOverride(defaultSeverity: Severity, logger: (line: { message: string, domain?: string, severity: Severity }) => void) {
  return function (...args: unknown[]) {
    // If first arg is a string with severity indicator, use that
    const detectedSeverity = detectSeverity(args[0]);
    const severity = detectedSeverity || defaultSeverity;

    // If severity is detected from the first argument, remove it from the message
    if (detectedSeverity) {
      args[0] = (args[0] as string).replace(/^\[(debug|info|warn|error)]/, '').trim();
    }

    // If the message still starts with [something], remove it, and add it as a domain
    let domain: string | undefined = undefined;
    if (typeof args[0] === 'string' && args[0].startsWith('[')) {
      const match = args[0].match(/^\[(.*?)]/);
      if (match && match[1].length > 0) {
        domain = match[1];
        args[0] = (args[0] as string).replace(/^\[.*?]/, '').trim();
      }
    }

    const message = formatLog(...args);
    logger({ severity, message, domain });
  };
}

const useJsonLogging = process.env.JSON_LOGGING === 'true';
if (useJsonLogging) {
  console.debug = createConsoleOverride('DEBUG', originalConsole.debug);
  console.log = createConsoleOverride('INFO', originalConsole.log);
  console.info = createConsoleOverride('INFO', originalConsole.info);
  console.warn = createConsoleOverride('WARNING', originalConsole.warn);
  console.error = createConsoleOverride('ERROR', originalConsole.error);
}
console.info(`[info] [json-logging] JSON logging is ${useJsonLogging ? 'enabled' : 'disabled'}`);
