export default class RendererEngine {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawRect(x, y, width, height, color = 'blue') {
    this.ctx.fillStyle = color
    this.ctx.fillRect(x, y, width, height)
  }

  drawCircle(x, y, radius, color = 'red') {
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }
}