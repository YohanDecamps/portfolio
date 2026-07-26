import { Component } from "../components/Component"
import { Transform } from '../components/Transform'
import { app } from "../main"

export class FollowPlayer extends Component {
  public offset: { x: number, y: number, z: number } = { x: 20, y: 20, z: 20 }

  constructor() {
    super()
  }

  start(): void {
  }


  update(dt: number) {
    const transform = this.gameObject?.getComponent(Transform)
    const playerTransform = app.findGameObjectsByTag("player")[0]?.getComponent(Transform)
    if (transform && playerTransform) {
      transform.setPosition(
        playerTransform.position.x + this.offset.x,
        playerTransform.position.y + this.offset.y,
        playerTransform.position.z + this.offset.z
      )
    }
  }
}
