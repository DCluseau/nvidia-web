export default class Player {
  constructor(x, y) {
    this.x = x
    this.y = y

    this.width = 40
    this.height = 60

    this.vx = 0
    this.vy = 0

    this.knockbackX = 0
    this.knockbackY = 0

    this.speed = 200        // px / seconde
    this.jumpForce = 400
    this.gravity = 800

    this.onGround = false

    this.isHit = false
    this.hitTimer = 0
  }

  hit(sourceX) {
    console.log('HIT CALLED')

    const direction = this.x < sourceX ? -1 : 1
    const power = 400

    this.knockbackX = direction * power
    this.knockbackY = -200

    if (this.isHit) return

    this.isHit = true
    this.hitTimer = 0.2 // secondes
  }

  update(dt, input, bounds) {
    // déplacement horizontal
    if (input.isDown('ArrowRight')) {
      this.vx = this.speed
    } else if (input.isDown('ArrowLeft')) {
      this.vx = -this.speed
    } else {
      this.vx = 0
    }

    // saut
    if (input.isDown('Space') && this.onGround) {
      this.vy = -this.jumpForce
      this.onGround = false
    }

    // gravité
    this.vy += this.gravity * dt

    // knockback s’ajoute au mouvement
    this.x += (this.vx + this.knockbackX) * dt
    this.y += (this.vy + this.knockbackY) * dt

    // amortissement du knockback
    this.knockbackX *= 0.9
    this.knockbackY *= 0.9

    if (Math.abs(this.knockbackX) < 1) this.knockbackX = 0
    if (Math.abs(this.knockbackY) < 1) this.knockbackY = 0

    // sol simple
    if (this.y + this.height >= bounds.height) {
      this.y = bounds.height - this.height
      this.vy = 0
      this.onGround = true
    }

    // collision
    if (this.isHit) {
      this.hitTimer -= dt
      if (this.hitTimer <= 0) {
        this.isHit = false
      }
    }
  }
}