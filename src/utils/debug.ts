import picocolors from 'picocolors';

type Debug = (msg: string, ...extra: any[]) => void;

let colorIndex = 0;

const colors = [
  'yellow',
  'green',
  'blue',
  'magenta',
  'white',
  'red',
  'cyan',
] as const;

type Color = typeof colors[number];

const colorMap = new Map<string, Color>();

/**
 * Simple version of debug-js
 *
 * Supports setting DEBUG for Node and localStorage.debug for browsers
 * Example: `DEBUG=pmu:*,verbose:pmu:* npm run dev`
 */
export const createDebug = (namespace: string): Debug => {
  let colorName = colorMap.get(namespace);
  if (!colorName) {
    colorName = colors[colorIndex % colors.length];
    colorIndex++; // Index go brrt

    colorMap.set(namespace, colorName);
  }

  const color = picocolors[colorName];

  return (msg, ...extra) => {
    const message = `${namespace}:${msg}`;

    const debugSetting =
      typeof window === 'undefined'
        ? process.env.DEBUG
        : window.localStorage.getItem('debug');

    if (!debugSetting) return;

    const debugNamespaces = debugSetting
      .split(',')
      .map((setting: string) => setting.replace('*', ''));

    const match = debugNamespaces.find((debugNamespace: string) =>
      message.startsWith(debugNamespace)
    );

    if (!match) return;

    const data = [message, ...extra].map(color);
    console.info(...data);
  };
};
