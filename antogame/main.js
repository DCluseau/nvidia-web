import Engine from './engine.js'
import RendererEngine from './renderer.js'
import World from './world.js'
import Input from './input.js'
import { createPlayer, createBall, createPlate, createGround, createBoss } from './pattern_entity.js'
import { Game } from './ability.js'


function initGame() {
  // GAME variable
  const game = new Game()
  // INPUT user
  const input = new Input()
  // CANVAS
  const canvas = document.getElementById('canvas')
  // Gestion Size Canvas
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  // Gestion Focus Canvas
  canvas.tabIndex = 1
  canvas.focus()
  // RENDERER
  const renderer = new RendererEngine(canvas)
  // WORLD
  const world = new World(game, input, canvas)
  // ENGINE
  const engine = new Engine({
    update: (dt) => {
      world.update(dt)
      game.update()

      if (game.isGameOver) {
        engine.stop()
        document.getElementById('gameover').style.display = 'block'
      }
    },
    render: () => {
      renderer.clear()
      world.render(renderer)  // chaque entité draw via sa Renderer Ability
    }
  })
  return [game, canvas, world, engine]
}

function controlGame(canvas,world) {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'r') location.reload()
  })

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  // CLICK pour spawn ball
  canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const ball = createBall({ x, y, width: 20, height: 20 })
  world.addEntity(ball)
})
}

function entityGame(game, canvas, world) {
  // Boss
  const boss = createBoss({ x: canvas.width / 2, y: 40, width: 120, height: 30, color: 'orange', game: game })
  world.addEntity(boss)

  // Player
  const player = createPlayer({ x: 100, y: 100, width: 40, height: 60, color: 'blue', game: game })
  world.addEntity(player)

  // Plateforme LH
  const plate_1 = createPlate({ x: 0, y: canvas.height - 150, width: canvas.width / 2, height: 20, color: 'green' })
  world.addEntity(plate_1)

  // Plateforme RH
  const plate_2 = createPlate({ x: (canvas.width / 2) * 2, y: canvas.height - 150, width: canvas.width / 2, height: 20, color: 'green' })
  world.addEntity(plate_2)

  // Invisible Ground
  const ground = createGround({ x: 0,  y: canvas.height + 5, width: canvas.width * 2, height: 10 })
  world.addEntity(ground)
}

function runGame() {
  const [game, canvas, world, engine] = initGame()
  controlGame(canvas, world)
  entityGame(game, canvas, world)
  engine.start()
}

runGame()