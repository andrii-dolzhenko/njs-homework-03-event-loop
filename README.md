# Node.js Homework 03 — Event Loop

One function demonstrating `process.nextTick`, `setImmediate`, and
`setTimeout(0)`, with a callback and Ukrainian console messages.

## Run and test

Requires Node.js 24.

```bash
npm install --package-lock=false
npm run check
```

- `npm start` — run the example in Node.js.
- `npm test` — run the original Vitest test.
- `npm run test:node` — verify the messages and callbacks in a real Node.js process.
- `npm run build` — generate the demo in `dist/index.html`.
- `npm run check` — check syntax, run both checks, and build the demo.

The function logs the first and last synchronous calls, then logs each
asynchronous operation and passes its name to the callback. The example
callback logs the completion message. The solution is in `src/main.js`.

The test checks `nextTick → setImmediate → setTimeout`. In real Node.js,
the relative order of `setImmediate` and `setTimeout(0)` depends on the
calling context; it is not a universal guarantee.

## Demo

Run `npm run build`, then open `dist/index.html` with VS Code Live Server.

The interactive page is an educational simulation of the test scenario.
Run it automatically, pause, advance one step, or reset. It reuses the
homework function with a controlled scheduler instead of native Node.js APIs.
The expandable Node.js output is captured from a real process during the build.

GitHub Actions runs the checks on pull requests and publishes the demo to
GitHub Pages after changes are merged into `main`.
