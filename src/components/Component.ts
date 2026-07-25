import { GameObject } from './GameObject'

export abstract class Component {
  protected gameObject: GameObject | null = null

  setGameObject(gameObject: GameObject): void {
    this.gameObject = gameObject
  }

  getGameObject(): GameObject | null {
    return this.gameObject
  }

  start(): void {
  }

  awake(): void {
  }

  update(dt: number): void {
  }
}

