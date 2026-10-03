import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { extname, resolve, sep } from 'node:path'

// A stoppable real origin tests service-worker fallback without WebKit's known
// setOffline navigation bug: https://github.com/microsoft/playwright/issues/42775
export async function productionServer() {
  const root = fileURLToPath(new URL('../dist/', import.meta.url))
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' }
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname
    if (!pathname.startsWith('/HealthTracker/')) { response.writeHead(404).end(); return }
    const relative = decodeURIComponent(pathname.slice('/HealthTracker/'.length)) || 'index.html'
    const file = resolve(root, relative)
    if (!file.startsWith(resolve(root) + sep)) { response.writeHead(404).end(); return }
    try {
      const bytes = await readFile(file)
      response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' })
      response.end(bytes)
    } catch { response.writeHead(404).end() }
  })
  let port = 0
  async function start() {
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(port, '127.0.0.1', () => { server.removeListener('error', reject); resolve() })
    })
    port = server.address().port
  }
  async function stop() {
    if (!server.listening) return
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
      server.closeAllConnections()
    })
  }
  await start()
  return { url: `http://127.0.0.1:${port}/HealthTracker/`, start, stop }
}
