

export default class World {
  constructor(game, input, canvas) {
    this.entities = []
    this.game = game
    this.input = input
    this.canvas = canvas
  }

  addEntity(entity) {
    this.entities.push(entity)
  }
  
  removeEntity(entity) {
    this.entities = this.entities.filter(e => e !== entity)
  }

  update(dt) {
    // STOP TOTAL
    if (this.game?.isGameOver) return

    // Sauvegarde de l'état précédent
    for (const e of this.entities) {
      e.savePrevious()
    }
    
    // Logique + collisions
    for (const e of this.entities) {
      e.update(dt, this)
    }

    // cleanup
    this.entities = this.entities.filter(e => e.alive !== false)
  }

  render(renderer) {
    for (const e of this.entities) {
      e.render(renderer)
    }
  }
}