import { random_num } from './utils.js'


function randomColor() {
  return `hsl(${Math.random() * 360}, 80%, 60%)`
}

export default class Ball {
  constructor({ x, y, radius, bounds }) {
    this.x = x ?? random_num(radius, bounds.width - radius)
    this.y = y ?? random_num(radius, bounds.height - radius)

    this.radius = radius
    this.vx = random_num(-200, 200) // pixels / seconde
    this.vy = random_num(-200, 200)

    this.gravity = 800 // px / s²
    this.friction = 0.98
    this.color = randomColor()
  }

  update(dt, bounds) {
    this.vy += this.gravity * dt

    this.x += this.vx * dt
    this.y += this.vy * dt

    if (this.y + this.radius >= bounds.height) {
      this.y = bounds.height - this.radius
      this.vy *= -this.friction
    }

    if (this.x + this.radius >= bounds.width || this.x - this.radius <= 0) {
      this.vx *= -this.friction
    }
  }
}