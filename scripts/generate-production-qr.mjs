import { createRequire } from 'node:module'
import { writeFile } from 'node:fs/promises'
import { deployment } from '../deployment.config.mjs'

const require = createRequire(import.meta.url)
const QRCode = require('qrcode-terminal/vendor/QRCode')
const levels = require('qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel')
const qr = new QRCode(-1, levels.M); qr.addData(deployment.productionUrl); qr.make()
const quiet = 4; const size = 9; const count = qr.getModuleCount(); const imageSize = (count + quiet * 2) * size; const modules = []
for (let row = 0; row < count; row += 1) for (let column = 0; column < count; column += 1) if (qr.isDark(row, column)) modules.push(`<rect x="${(column + quiet) * size}" y="${(row + quiet) * size}" width="${size}" height="${size}"/>`)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${imageSize} ${imageSize}" role="img" aria-labelledby="title desc" shape-rendering="crispEdges"><title id="title">Health Tracker production QR code</title><desc id="desc">Opens ${deployment.productionUrl}</desc><rect width="100%" height="100%" fill="#fff"/><g fill="#145c52">${modules.join('')}</g></svg>`
await writeFile(new URL('../docs/production-app-qr.svg', import.meta.url), svg)
console.log(`Generated QR for ${deployment.productionUrl}`)
