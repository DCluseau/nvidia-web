import { createBall, createPlayerShot } from './pattern_entity.js'


/**
 * ─────────────────────────────────────────────────────────────
 * COLLISION SYSTEM — GOLDEN RULE
 * ─────────────────────────────────────────────────────────────
 *
 * 1️⃣ POINT DE VUE PHYSIQUE
 * ------------------------
 * All collision tests are evaluated from the point of view
 * of the moving entity `e`.
 *
 * Example:
 *   "Is `e` hitting something on the left / right / above / below?"
 *
 * `e` is ALWAYS the observer of the collision.
 *
 *
 * 2️⃣ GAMEPLAY EVENT OWNERSHIP
 * ---------------------------
 * Collision events are NOT owned by `e` by default.
 *
 * An event is dispatched to the entity that owns
 * the corresponding Receiver component:
 *
 *   - HeadReceiver   → entity that can be stomped
 *   - FootReceiver   → entity that can land
 *   - BodyReceiver   → entity that can be damaged by contact
 *   - BonusReceiver  → entity that grants score
 *
 * The receiver decides what the collision means:
 *   - damage
 *   - score
 *   - bounce
 *   - death
 *
 *
 * 3️⃣ SEPARATION OF RESPONSIBILITIES
 * --------------------------------
 * Detection  → Collider (physics, sweep, previous state)
 * Meaning    → Receiver (gameplay rules)
 * Resolution → Physics (position, velocity, grounding)
 *
 *
 * 4️⃣ MENTAL MODEL
 * ---------------
 * The collider asks:
 *   "What is `e` doing relative to others?"
 *
 * The receiver answers:
 *   "What does this collision mean for me?"
 *
 *
 * IMPORTANT:
 * ----------
 * Detection ≠ Reaction
 * The same physical collision may have different gameplay
 * effects depending on which entity owns the Receiver.
 *
 * ─────────────────────────────────────────────────────────────
 */


export class Renderer {
  render(renderer) {
    const e = this.entity
    const radius = e.radius || (e.components.find(c => c.radius)?.radius)

    if (radius) {
      renderer.drawCircle(e.x, e.y, radius, e.color)
    } else {
      renderer.drawRect(e.left, e.top, e.width, e.height, e.color)
    }
  }
}

export class Movement {
  constructor(speed = 200) {
    this.speed = speed
    this.vx = 0
    this.vy = 0
  }

  update(dt) {
    // Ne touche PLUS à la position
  }
}

export class Gravity {
  constructor(strength = 800) {
    this.strength = strength
  }

  update(dt) {
    const e = this.entity
    if (!e.movement) return
    if (e.grounded?.onGround) return

    e.movement.vy += this.strength * dt
  }
}


export class PlayerInput {
  constructor() {
    this.cooldown = 0
  }

  update(dt, world) {
    if (world.game?.isGameOver) return

    const e = this.entity
    const move = e.movement
    if (!move) return

    if (this.cooldown > 0) this.cooldown -= dt

    // déplacements existants...
    // const move = this.entity.movement
    if (!move) return

    if (world.input.isDown('ArrowLeft')) move.vx = -200
    else if (world.input.isDown('ArrowRight')) move.vx = 200
    else move.vx = 0

    // TIR
    if (world.input.isDown('ArrowUp') && this.cooldown <= 0) {
      console.log("Tir", world.game.shoot)
      if (world.game.shoot.shootValue > 0) {
        console.log("Tir Réussi")
        e.bonusreceiver?.onHitShoot()
        const shot = createPlayerShot({
          x: e.x,
          y: e.top - 10
        })
        world.addEntity(shot)
        this.cooldown = 0.4
      }
    }
  }
}

export class Knockback {
  constructor() {
    this.kx = 0
    this.ky = 0
  }

  apply(x, y) {
    this.kx = x
    this.ky = y
  }

  update(dt) {
    this.entity.x += this.kx * dt
    this.entity.y += this.ky * dt

    this.kx *= 0.9
    this.ky *= 0.9
  }
}

export class Jump {
  constructor(force = 560) {
    this.force = force
    this.bufferTime = 0
  }

  update(dt, world) {
    const e = this.entity
    if (!e.movement || !e.grounded) return

    // Buffer de saut (plus permissif, très Mario)
    if (world.input.isDown('Space')) {
      this.bufferTime = 0.1
    }

    if (this.bufferTime > 0 && e.grounded.onGround) {
      e.movement.vy = -this.force
      e.grounded.leave()
      this.bufferTime = 0
    }

    this.bufferTime -= dt
  }
}

export class BallForme {
  constructor(radius = 20) {
    this.radius = radius
  }
}

export class Bounce {
  constructor(power = 0.7) {
    this.power = power
  }

  apply() {
    if (this.entity.movement) {
      this.entity.movement.vy =
        -Math.abs(this.entity.movement.vy) * this.power
    }
  }
}

export class Integrator {
  update(dt) {
    const e = this.entity
    if (!e.movement) return

    e.x += e.movement.vx * dt
    e.y += e.movement.vy * dt
  }
}

export class Ground {
  constructor() {
    this.isGround = true
  }
}

export class Grounded {
  constructor() {
    this.onGround = false
  }

  land() {
    if (!this.onGround) {
      this.onGround = true
      this.entity.bounce?.apply()
    }
  }

  leave() {
    this.onGround = false
  }
}

export class Solid {
  constructor({ oneWay = false } = {}) {
    this.oneWay = oneWay
  }
}

export class GroundDetector {
  update(dt, world) {
    const e = this.entity

    // Le collider n'agit que sur les entités mobiles
    if (!e.movement) return

    // Par défaut, l'entité n'est pas au sol
    e.grounded?.leave()

    // Position verticale anticipée (sweep)
    const nextBottom = e.bottom + e.movement.vy * dt

    for (const other of world.entities) {
      if (!other.ground) continue

      const falling = e.movement.vy >= 0
      const willLand =
        e.bottom <= other.top &&
        nextBottom >= other.top &&
        e.right > other.left &&
        e.left < other.right

      if (falling && willLand) {      
        // On pose l'entité SUR le sol (référence centre)
        e.y = other.top - e.halfHeight
        
        // Réaction verticale
        if (e.bounce) e.bounce.apply()
        else e.movement.vy = 0
        
        // Signal aux abilities
        e.grounded?.land()
      }
    }
  }
}

export class Collider {
  update(dt, world) {
    const e = this.entity

    // Le collider n'agit que sur les entités mobiles
    if (!e.movement) return
    
    // Position verticale anticipée (sweep)
    const nextBottom = e.bottom + e.movement.vy * dt

    // Par défaut, l'entité n'est pas au sol
    e.grounded?.leave()

    for (const other of world.entities) {
      if (other === e) continue
      if (!other.solid || !other.ground) continue

      // --- Détection verticale ---
      const wasAbove = e.bottom <= other.top
      const willCross = nextBottom > other.top

      // --- Test horizontal (overlap X) ---
      const overlapX =
        e.right > other.left &&
        e.left < other.right

      if (wasAbove && willCross && overlapX)
      {
        // On pose l'entité SUR le sol (référence centre)
        e.y = other.top - e.halfHeight
        
        // Réaction verticale
        if (e.bounce) e.bounce.apply()
        else e.movement.vy = 0
        
        // Signal aux abilities
        e.grounded?.land()
      }
    }
  }
}

export class ColliderX {
  update(dt, world) {
    const e = this.entity
    if (!e.movement) return

    const nextX = e.x + e.movement.vx * dt

    for (const other of world.entities) {
      if (other === e) continue
      if (!other.solid) continue

      const overlapY =
        e.bottom > other.top &&
        e.top < other.bottom

      if (!overlapY) continue

      // Vers la droite
      if (e.movement.vx > 0 &&
          e.right <= other.left &&
          nextX + e.halfWidth >= other.left) {

        e.x = other.left - e.halfWidth
        e.movement.vx = 0
      }

      // Vers la gauche
      if (e.movement.vx < 0 &&
          e.left >= other.right &&
          nextX - e.halfWidth <= other.right) {

        e.x = other.right + e.halfWidth
        e.movement.vx = 0
      }
    }
  }
}

export class ColliderYTop {
  update(dt, world) {
    const e = this.entity
    if (!e.movement) return

    // On ne gère que la montée
    if (e.movement.vy >= 0) return

    const nextTop = e.top + e.movement.vy * dt

    for (const other of world.entities) {
      if (other === e) continue
      if (!other.solid) continue

      const overlapX =
        e.right > other.left &&
        e.left < other.right

      if (!overlapX) continue

      const wasBelow = e.top >= other.bottom
      const willHit = nextTop <= other.bottom

      // Vers le haut
      if (wasBelow && willHit) {

        e.y = other.bottom + e.halfHeight
        e.movement.vy = 0
      }
    }
  }
}

export class Body {
  constructor({ mass = 1, canBeCarried = true } = {}) {
    this.mass = mass
    this.canBeCarried = canBeCarried
  }
}

export class Score {
  constructor(game) {
    this.game = game
    this.scoreValue = 0
  }

  add(n = 1) {
    this.scoreValue += n
    console.log("Score:", this.scoreValue)
    this.game.updateHUD()
  }
}

export class Shoot {
  constructor(game) {
    this.game = game
    this.shootValue = 0
  }

  add(n = 1) {
    this.shootValue += n
    console.log("Shoot:", this.shootValue)
    this.game.updateHUD()
  }

  remove(n = 1) {
    this.shootValue -= n
    console.log("Shoot:", this.shootValue)
    this.game.updateHUD()
  }
}

export class Life {
  constructor(game, max = 10) {
    this.game = game
    this.lifeValue = max
  }

  remove(n = 1) {
    this.lifeValue -= n
    console.log("Life:", this.lifeValue)
    this.game.updateHUD()
  }
}

export class Game {
  constructor() {
    this.score = new Score(this)
    this.life = new Life(this)
    this.shoot = new Shoot(this)
    this.isGameOver = false

    this.scoreEl = document.getElementById('score')
    this.lifeEl = document.getElementById('life')
    this.shootEl = document.getElementById('shoot')

    this.updateHUD()
  }

  onBallCrushed() {
    this.score.add(3)
    this.shoot.add(1)
  }

  onLifeHit() {
    this.life.remove(1)
  }

  onShotFired() {
    this.shoot.remove(1)
  }

  onBossHit() {
    this.score.add(10)
  }

  update() {
    if (this.life.lifeValue <= 0) {
      this.isGameOver = true
    }
  }

  updateHUD() {
    if (this.scoreEl) this.scoreEl.textContent = `Score : ${this.score.scoreValue}`
    if (this.lifeEl) this.lifeEl.textContent = `Vie : ${this.life.lifeValue}`
    if (this.shootEl) this.shootEl.textContent = `Tir restant : ${this.shoot.shootValue}`
  }
}

export class DamageReceiver {
  constructor(game) {
    this.game = game
    this.cooldown = 0
  }

  update(dt) {
    this.cooldown -= dt
  }

  onHit() {
    if (this.cooldown > 0) return
    // console.log("Received Damage !")

    this.cooldown = 0.5   // anti spam
    this.game.onLifeHit()
  }
}

export class BonusReceiver {
  constructor(game) {
    this.game = game
  }

  onTakeBall() {
    // console.log("Received Bonus !")

    this.game.onBallCrushed()
  }

  onTakeBoss() {
    // console.log("Received Bonus !")

    this.game.onBossHit()
  }

  onHitShoot() {
    // console.log("Loose Bonus !")

    this.game.onShotFired()
  }
}

export class HeadReceiver {
  onHitFromAbove(other, dt) {
    // Sur la tête du joueur
    // console.log("Hit head player !!!", this)
    
    // Une balle tombe sur le Player
    this.entity.damagereceiver?.onHit()

    other.movement.vy = Math.abs(other.movement.vy) - 300 * dt
  }
}

export class BodyReceiver {
  onHitFromLateral() {
    // Contre le joueur
    // console.log("Hit body player !!!", this)
    
    // Player touche une balle
    this.entity.damagereceiver?.onHit()
  }
}

export class FootReceiver {
  onHitFromBelow() {
    // Sous les pieds
    // console.log("Under foot player !!!", this)
    
    // Player écrase une balle
    this.entity.bonusreceiver?.onTakeBall()
  }
}

export class ColliderBody {
  update(dt, world) {
    const e = this.entity
    if (!e.movement || !e.solid || !e.body) return

    const nextTop = e.top + e.movement.vy * dt
    const nextBottom = e.bottom + e.movement.vy * dt
    const nextX = e.x + e.movement.vx * dt

    for (const other of world.entities) {
      if (other === e) continue
      if (!other.solid || !other.body || !other.movement) continue

      const overlapX =
        e.right > other.left &&
        e.left < other.right
    
      // ---- collision latérale / contact dangereux
      const overlapY =
        e.bottom > other.top &&
        e.top < other.bottom
      
      // Contact à droite : e percute other par son côté gauche
      if (overlapY && e.right <= other.left &&
          nextX + e.halfWidth >= other.left) {

        // console.log('Position RH de e (e.right/other.left): e=', e.name, ', other=', other.name)
        // console.log(e.name ,'(e) percute', other.name,'(other) par le côté gauche de', other.name,'(other)')
        e.bodyreceiver?.onHitFromLateral()

        continue
      }

      // Contact à gauche : e percute other par son côté droit
      if (overlapY && e.left >= other.right &&
          nextX - e.halfWidth <= other.right) {

        // console.log('Position LH de e (e.left/other.right): e=', e.name, ', other=', other.name)
        // console.log(e.name ,'(e) percute', other.name,'(other) par le côté droit de', other.name,'(other)')
        e.bodyreceiver?.onHitFromLateral()

        continue
      }

      // Vérification si dans la tranche de X
      if (!overlapX) continue

      // ---- e tombe SUR other
      const hitsFromAbove =
        e.movement.vy > 0 &&
        e.prevBottom <= other.prevTop &&
        nextBottom >= other.top

      if (hitsFromAbove) {

        // EVENT STABLE (score, hit, damage…)
        other.headreceiver?.onHitFromAbove(e, dt)

        // ---- Résolution physique
        if (other.body.mass >= e.body.mass) {
          e.y = other.top - e.halfHeight

          // Réaction verticale
          if (e.bounce) e.bounce.apply()
          else e.movement.vy = 0
          
          // Signal aux abilities
          e.grounded?.land()

        } else {
          other.y = e.bottom + other.halfHeight
          other.movement.vy = e.movement.vy
        }

        continue
      }

      // ---- e est SOUS other
      const hitsFromBelow =
        e.movement.vy < 0 &&
        e.prevTop >= other.prevBottom &&
        nextTop <= other.bottom

      if (hitsFromBelow) {
        other.footreceiver?.onHitFromBelow()

        if (other.body.mass >= e.body.mass) {
          e.y = other.bottom + e.halfHeight
          e.movement.vy = 0
        }

        continue
      }
    }
  }
}

export class ColliderShot {
  update(dt, world) {
    const e = this.entity
    if (!e.isShot) return

    for (const other of world.entities) {
      if (!other.isBoss) continue

      const overlapX =
        e.right > other.left &&
        e.left < other.right

      const overlapY =
        e.bottom > other.top &&
        e.top < other.bottom

      if (overlapX && overlapY) {
        // console.log("Shot hit boss", other)

        other.bonusreceiver?.onTakeBoss()
        e.alive = false
      }
    }
  }
}

export class BossSpawner {
  constructor(minDelay = 1, maxDelay = 10) {
    this.minDelay = minDelay
    this.maxDelay = maxDelay
    this.timer = this.randomDelay()
  }

  randomDelay() {
    return this.minDelay + Math.random() * (this.maxDelay - this.minDelay)
  }

  update(dt, world) {
    this.timer -= dt
    if (this.timer > 0) return

    // Spawn balle sous le boss
    const boss = this.entity

    const ball = createBall({
      x: boss.x,
      y: boss.bottom + 20,
      width: 20,
      height: 20,
      color: boss.color
    })

    // vitesse initiale vers le bas
    ball.movement.vy = 100

    world.addEntity(ball)

    this.timer = this.randomDelay()
  }
}

export class BossMovement {
  constructor(speed = 150) {
    this.speed = speed
    this.direction = 1
  }

  update(dt, world) {
    const e = this.entity
    e.x += this.speed * this.direction * dt

    // rebond sur les bords
    if (e.left <= 0) {
      e.x = e.halfWidth
      this.direction = 1
    }

    if (e.right >= world.canvas.width) {
      e.x = world.canvas.width - e.halfWidth
      this.direction = -1
    }
  }
}