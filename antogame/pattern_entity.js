import Entity from './entity.js'
import { 
  Movement, Gravity, PlayerInput, 
  Knockback, Collider, Renderer, 
  BallForme, Bounce, Integrator, 
  Grounded, Solid, Ground, 
  GroundDetector, Jump, ColliderX,
  ColliderYTop, ColliderBody, Body,
  HeadReceiver, FootReceiver, DamageReceiver, 
  BonusReceiver, BodyReceiver, BossSpawner, 
  BossMovement, ColliderShot
} from './ability.js'


export function createPlayer({ x: x, y: y, width: width, height: height, color: color, game: game }) {
  return new Entity({ name: "player", x: x, y: y, width: width, height: height, color: color }) 
   /**
   * Si le player porte les receivers,
   * alors c’est e qui doit recevoir l’événement.
   */
    .add(new Movement())
    .add(new Grounded())
    .add(new GroundDetector())
    .add(new Body({ mass: 10 }))

    .add(new HeadReceiver())
    .add(new BodyReceiver())
    .add(new FootReceiver())
    .add(new DamageReceiver(game))
    .add(new BonusReceiver(game))

    .add(new Jump())
    .add(new PlayerInput())
    .add(new Knockback())
    .add(new Solid())
  
    .add(new Gravity())
    .add(new ColliderX())
    .add(new ColliderYTop())
    .add(new Collider())
    .add(new ColliderBody())
  
    .add(new Integrator())
    .add(new Renderer())   // pour le visuel
}

export function createBall({ x, y, width: width, height: height, color: color }) {
  return new Entity({ name: "ball", x, y, width: width, height: height, color: color })
      .add(new Movement())
      .add(new Grounded())
      .add(new GroundDetector())
      .add(new Body({ mass: 1 }))
      .add(new BallForme(10))
      .add(new Bounce(0.9))
      .add(new Solid())
  
      .add(new Gravity())
      .add(new ColliderX())
      .add(new ColliderYTop())
      .add(new Collider())
      .add(new ColliderBody())
  
      .add(new Integrator()) // ⚠️ TOUJOURS EN DERNIER
      .add(new Renderer())   // dessiner le cercle
}

export function createPlate({ x: x, y: y, width: width, height: height, color: color }) {
  return new Entity({  name: "plate", x: x, y: y, width: width, height: height, color: color })
    .add(new Ground())
    .add(new Solid())
    .add(new Renderer())
}

export function createGround({ x: x,  y: y, width: width, height: height }) {
  return new Entity({ name: "ground", x: x,  y: y, width: width, height: height })
    .add(new Ground())
    .add(new Solid())
}

export function createBoss({ x: x, y: y, width: width, height: height, color: color, game: game }) {
  const boss = new Entity({ name: "boss", x: x, y: y, width: width, height: height, color: color })
    .add(new BossMovement())
    .add(new BossSpawner(1, 4))
    .add(new BonusReceiver(game))
    .add(new Integrator())
    .add(new Renderer())

  boss.isBoss = true
  console.log(boss)

  return boss
}

export function createPlayerShot({ x, y }) {
  const shot = new Entity({ name: "shot", x, y, width: 8, height: 16, color: 'brown' })
    .add(new Movement())
    .add(new Solid())
    .add(new Body({ mass: 0.1 }))
    .add(new ColliderShot())
    .add(new Integrator())
    .add(new Renderer())
    
  shot.movement.vy = -600
  shot.isShot = true
  console.log(shot)

  return shot
}