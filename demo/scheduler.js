export function createScheduler() {
  const queues = { nextTick: [], setImmediate: [], setTimeout: [] }

  return {
    nextTick: callback => queues.nextTick.push(callback),
    setImmediate: callback => queues.setImmediate.push(callback),
    setTimeout: callback => queues.setTimeout.push(callback),
    pending: () => Object.fromEntries(Object.entries(queues).map(([name, queue]) => [name, queue.length])),
    advance() {
      for (const [name, queue] of Object.entries(queues)) {
        if (queue.length) {
          queue.shift()()
          return name
        }
      }
      return null
    }
  }
}
