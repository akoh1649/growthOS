import http from 'http';
import net from 'net';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');

const proxyPort = parseInt(process.env.PORT || '3000');
const metroPort = proxyPort + 1;

// Expand dynamic env vars that were previously in the shell dev script
const replitExpoDomain = process.env.REPLIT_EXPO_DEV_DOMAIN || '';
const replitDevDomain = process.env.REPLIT_DEV_DOMAIN || 'localhost';
const replId = process.env.REPL_ID || '';

let metroReady = false;
const pendingRequests = [];

async function pollMetroReady() {
  while (true) {
    const ready = await new Promise((resolve) => {
      const socket = net.connect(metroPort, '127.0.0.1');
      socket.setTimeout(800);
      socket.on('connect', () => { socket.destroy(); resolve(true); });
      socket.on('error', () => resolve(false));
      socket.on('timeout', () => { socket.destroy(); resolve(false); });
    });

    if (ready) {
      metroReady = true;
      console.log(`[dev-proxy] Metro ready on :${metroPort}, flushing ${pendingRequests.length} buffered request(s)`);
      for (const [req, res] of pendingRequests) forwardHttp(req, res);
      pendingRequests.length = 0;
      break;
    }
    await new Promise((r) => setTimeout(r, 800));
  }
}

function forwardHttp(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: metroPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${metroPort}` },
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  proxyReq.on('error', () => {
    if (!res.headersSent) res.writeHead(502);
    res.end('Bad Gateway');
  });
  if (req._body) {
    proxyReq.end(req._body);
  } else {
    req.pipe(proxyReq, { end: true });
  }
}

const server = http.createServer((req, res) => {
  // Answer health-check immediately so workflow detection passes right away
  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('packager-status:running');
    return;
  }

  if (metroReady) {
    forwardHttp(req, res);
  } else {
    // Buffer until Metro is ready
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      req._body = Buffer.concat(chunks);
      pendingRequests.push([req, res]);
    });
  }
});

// WebSocket / HMR upgrade tunnel
server.on('upgrade', (req, socket, head) => {
  const target = net.connect(metroPort, '127.0.0.1', () => {
    const requestLine = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    const headers = Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n');
    target.write(`${requestLine}${headers}\r\n\r\n`);
    if (head && head.length) target.write(head);
    target.pipe(socket);
    socket.pipe(target);
  });
  target.on('error', () => socket.destroy());
  socket.on('error', () => target.destroy());
});

server.listen(proxyPort, '0.0.0.0', () => {
  console.log(`[dev-proxy] Listening on 0.0.0.0:${proxyPort} → Metro on localhost:${metroPort}`);
  pollMetroReady();
});

server.on('error', (err) => {
  console.error('[dev-proxy] Fatal:', err.message);
  process.exit(1);
});

// Metro env — expand the variables that used to be in the shell dev script
const metroEnv = {
  ...process.env,
  PORT: String(metroPort),
  EXPO_PACKAGER_PROXY_URL: replitExpoDomain ? `https://${replitExpoDomain}` : '',
  EXPO_PUBLIC_DOMAIN: replitDevDomain,
  EXPO_PUBLIC_REPL_ID: replId,
  REACT_NATIVE_PACKAGER_HOSTNAME: replitDevDomain,
};

// Run Metro from the mobile artifact directory
const metro = spawn('pnpm', ['exec', 'expo', 'start', '--port', String(metroPort)], {
  stdio: 'inherit',
  env: metroEnv,
  cwd: path.join(__dirname, '..'),
});

metro.on('exit', (code) => { server.close(); process.exit(code ?? 0); });
process.on('SIGTERM', () => { metro.kill('SIGTERM'); server.close(); });
process.on('SIGINT', () => { metro.kill('SIGINT'); server.close(); });
