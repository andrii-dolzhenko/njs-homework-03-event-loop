import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export function captureNodeExample() {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../src/main.js', import.meta.url))], {
    encoding: 'utf8',
    timeout: 5000
  })

  assert.ifError(result.error)
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stderr, '')

  const lines = result.stdout.trim().split(/\r?\n/)
  assert.equal(lines.length, 8)
  assert.deepEqual(lines.slice(0, 2), ['Перший виклик', 'Останній виклик'])

  const operations = []
  for (let index = 2; index < lines.length; index += 2) {
    const operation = lines[index].replace('Виконано ', '')
    assert.equal(lines[index], `Виконано ${operation}`)
    assert.equal(lines[index + 1], `Завершено виконання: ${operation}`)
    operations.push(operation)
  }

  assert.equal(operations[0], 'nextTick')
  assert.deepEqual([...operations].sort(), ['nextTick', 'setImmediate', 'setTimeout'])
  return lines.join('\n')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(captureNodeExample())
  console.log('Real Node.js checks passed.')
}
