import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { captureNodeExample } from './check-node.js'

const root = new URL('../', import.meta.url)
const source = await readFile(new URL('src/main.js', root), 'utf8')
const start = source.indexOf('function asyncOperationDemo(callback) {')
const end = source.indexOf('\nasyncOperationDemo(', start)
assert.ok(start >= 0 && end > start, 'Cannot locate the homework function')
const core = source.slice(start, end).trim()

const browserFunction = `export function runDemo(scheduler, onLog, callback) {
  const process = { nextTick: scheduler.nextTick }
  const setImmediate = scheduler.setImmediate
  const setTimeout = scheduler.setTimeout
  const console = { log: onLog }

${core.split('\n').map(line => `  ${line}`).join('\n')}

  asyncOperationDemo(callback)
}
`

const escapeHtml = text => text.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character])

const template = await readFile(new URL('demo/index.html', root), 'utf8')
assert.equal(template.split('{{node-example}}').length, 2)
assert.equal(template.split('{{core-source}}').length, 2)
const html = template
  .replace('{{node-example}}', escapeHtml(captureNodeExample()))
  .replace('{{core-source}}', escapeHtml(core))

await mkdir(new URL('dist/', root), { recursive: true })
await writeFile(new URL('dist/index.html', root), html)
await writeFile(new URL('dist/demo-function.js', root), browserFunction)
for (const file of ['app.js', 'scheduler.js']) {
  await copyFile(new URL(`demo/${file}`, root), new URL(`dist/${file}`, root))
}
console.log('Demo built: dist/index.html')
