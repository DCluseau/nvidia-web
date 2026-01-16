export default class Entity {
  constructor({ name, x, y, width, height, color: color }) {
    this.name = name
    this.x = x
    this.y = y
    this.prevX = x
    this.prevY = y
    this.width = width
    this.height = height
    this.color = color

    this.components = []
    this.alive = true
  }

  get halfWidth() {
    return this.width ? this.width / 2 : this.radius
  }

  get halfHeight() {
    return this.height ? this.height / 2 : this.radius
  }

  get top() {
    return this.y - this.halfHeight
  }

  get bottom() {
    return this.y + this.halfHeight
  }

  get left() {
    return this.x - this.halfWidth
  }

  get right() {
    return this.x + this.halfWidth
  }

  get prevTop() { 
    return this.prevY - this.halfHeight
  }

  get prevBottom() { 
    return this.prevY + this.halfHeight
  }

  savePrevious() {
    this.prevX = this.x
    this.prevY = this.y
  }

  add(component) {
    component.entity = this
    this.components.push(component)

    // Optionnel : stocker par nom de classe pour un accès facile
    this[component.constructor.name.toLowerCase()] = component

    return this
  }

  update(dt, world) {
    for (const c of this.components) {
      if (c.update) c.update(dt, world)
    }
  }

  render(renderer) {
    for (const c of this.components) {
      if (c.render) c.render(renderer)
    }
  }
}