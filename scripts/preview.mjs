import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('dist/sora-angular/browser');
const prefix = '/sora-angular/';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain',
};
createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method ?? '')) {
    response.writeHead(405);
    response.end();
    return;
  }
  let path;
  try {
    path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }
  if (path === '/sora-angular') {
    response.writeHead(302, { location: prefix });
    response.end();
    return;
  }
  if (!path.startsWith(prefix)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  const file = resolve(root, path.slice(prefix.length) || 'index.html');
  if (!file.startsWith(`${root}/`)) {
    response.writeHead(403);
    response.end();
    return;
  }
  try {
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'content-type': types[extname(file)] ?? 'application/octet-stream',
      'x-content-type-options': 'nosniff',
      'cache-control': 'no-cache',
    });
    response.end(request.method === 'HEAD' ? undefined : await readFile(file));
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(4180, '127.0.0.1', () =>
  console.log('Sora preview: http://127.0.0.1:4180/sora-angular/'),
);
