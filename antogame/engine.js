export default class Engine {
  constructor({ fps = 60, update, render }) {
    this.fps = fps
    this.update = update
    this.render = render

    this.lastTime = 0
    this.running = false
  }

  start() {
    this.running = true
    requestAnimationFrame(this.loop.bind(this))
  }

  stop() {
    this.running = false
  }

  loop(timestamp) {
    if (!this.running) return

    const deltaTime = (timestamp - this.lastTime) / 1000
    this.lastTime = timestamp

    this.update(deltaTime)
    this.render()

    requestAnimationFrame(this.loop.bind(this))
  }
}