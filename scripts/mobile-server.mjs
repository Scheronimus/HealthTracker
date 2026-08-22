import { networkInterfaces } from 'node:os'
import qrcode from 'qrcode-terminal'
import { createServer } from 'vite'

const addresses = Object.entries(networkInterfaces()).flatMap(([adapter, entries]) => (entries ?? []).map((entry) => ({ adapter, ...entry }))).filter((entry) => entry.family === 'IPv4' && !entry.internal && !entry.address.startsWith('169.254.')).sort((a, b) => Number(/wi-?fi|wlan|ethernet/i.test(b.adapter)) - Number(/wi-?fi|wlan|ethernet/i.test(a.adapter)))
if (!addresses.length) { console.error('No local network connection found. Connect to Wi-Fi and try again.'); process.exit(1) }
const server = await createServer({ server: { host: '0.0.0.0' } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') { await server.close(); throw new Error('Could not determine the development server port.') }
const url = `http://${addresses[0].address}:${address.port}${server.config.base}`
console.log(`\nHealth Tracker mobile test\nNetwork: ${addresses[0].adapter}\nAddress: ${url}\n`)
qrcode.generate(url, { small: true })
console.log('\nKeep this window open. The phone and computer must use the same Wi-Fi. Press Ctrl+C to stop.\n')
async function stop() { await server.close(); process.exit() }
process.on('SIGINT', stop); process.on('SIGTERM', stop)
