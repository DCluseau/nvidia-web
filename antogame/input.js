export default class Input {
  constructor() {
    this.keys = {}

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
      this.preventScroll(e)
    })

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })
  }

  isDown(code) {
    return !!this.keys[code]
  }

  preventScroll(e) {
    const blocked = [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Space'
    ]

    if (blocked.includes(e.code)) {
      e.preventDefault()
    }
  }
}
