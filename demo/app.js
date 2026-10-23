import { runDemo } from './demo-function.js'
import { createScheduler } from './scheduler.js'

const runButton = document.querySelector('#run')
const nextButton = document.querySelector('#next')
const resetButton = document.querySelector('#reset')
const status = document.querySelector('#status')
const journal = document.querySelector('#journal')
const empty = document.querySelector('#journal-empty')
const progress = document.querySelector('#progress')
const stages = [...document.querySelectorAll('[data-stage]')]
const counters = [...document.querySelectorAll('[data-queue]')]
const descriptions = {
  sync: 'Синхронні повідомлення виведено. Три операції очікують виконання.',
  nextTick: 'Виконано nextTick. Callback отримав ідентифікатор операції.',
  setImmediate: 'Виконано setImmediate. Callback отримав ідентифікатор операції.',
  setTimeout: 'Виконано setTimeout. Усі три операції завершено.'
}

let scheduler = null
let timer = null
let step = 0

function appendLog(message, callback = false) {
  const entry = document.createElement('li')
  const label = document.createElement('span')
  const text = document.createElement('code')
  entry.className = 'journal__entry'
  label.className = 'journal__type'
  label.textContent = callback ? 'CALLBACK' : 'LOG'
  text.textContent = message
  entry.append(label, text)
  journal.append(entry)
  empty.hidden = true
}

function render(activeStage) {
  const pending = scheduler?.pending() ?? {}
  counters.forEach(counter => { counter.textContent = pending[counter.dataset.queue] ?? 0 })
  stages.forEach((stage, index) => {
    stage.dataset.state = index < step - 1 ? 'done' : stage.dataset.stage === activeStage ? 'active' : 'waiting'
    if (stage.dataset.stage === activeStage) stage.setAttribute('aria-current', 'step')
    else stage.removeAttribute('aria-current')
  })
  progress.value = step
  nextButton.disabled = timer !== null || step === 4
  runButton.textContent = timer !== null ? 'Пауза' : step === 4 ? 'Запустити знову' : step > 0 ? 'Продовжити' : 'Запустити'
}

function pause() {
  clearInterval(timer)
  timer = null
  render(step === 0 ? null : stages[step - 1].dataset.stage)
}

function reset() {
  pause()
  scheduler = null
  step = 0
  journal.replaceChildren()
  empty.hidden = false
  status.textContent = 'Готово до запуску. Натисніть «Запустити» або «Наступний крок».'
  render(null)
}

function advance() {
  let activeStage
  if (step === 0) {
    scheduler = createScheduler()
    runDemo(scheduler, message => appendLog(message), operation => {
      appendLog(`Завершено виконання: ${operation}`, true)
    })
    activeStage = 'sync'
  } else {
    activeStage = scheduler.advance()
  }
  step += 1
  if (step === 4) {
    clearInterval(timer)
    timer = null
  }
  status.textContent = `Крок ${step} із 4. ${descriptions[activeStage]}`
  render(activeStage)
}

runButton.addEventListener('click', () => {
  if (timer !== null) {
    pause()
    return
  }
  if (step === 4) reset()
  if (step === 0) advance()
  timer = setInterval(advance, 850)
  render(stages[step - 1].dataset.stage)
})

nextButton.addEventListener('click', advance)
resetButton.addEventListener('click', reset)
window.addEventListener('pagehide', pause)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause()
})

reset()
document.querySelector('#playground').hidden = false
