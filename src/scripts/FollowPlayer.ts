import { Component } from "../components/Component"
import { Transform } from '../components/Transform'
import { app } from "../main"

export class FollowPlayer extends Component {
  public offset: { x: number, y: number, z: number } = { x: 20, y: 20, z: 20 }
  private playerTransform: Transform | null = null

  constructor() {
    super()
  }

  start(): void {
    // Cache once; update() runs every frame (avoid per-frame findGameObjectsByTag allocs)
    this.playerTransform = app.findGameObjectsByTag("player")[0]?.getComponent(Transform) || null
  }


  update(dt: number) {
    const transform = this.gameObject?.getComponent(Transform)
    if (transform && this.playerTransform) {
      transform.setPosition(
        this.playerTransform.position.x + this.offset.x,
        this.playerTransform.position.y + this.offset.y,
        this.playerTransform.position.z + this.offset.z
      )
    }
  }
}
