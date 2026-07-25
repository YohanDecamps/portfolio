import RAPIER from "@dimforge/rapier3d-compat"
import { Component } from "./Component"
import { Transform } from "./Transform"
import { world } from "../main"

export class RigidBody extends Component {
  private body: RAPIER.RigidBody
  public isDynamic: boolean = true

  constructor() {
    super()
    this.body = null as unknown as RAPIER.RigidBody
  }

  start(): void {
    if (this.isDynamic) {
      this.body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic())
    } else {
      this.body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
    }
    const transform = this.gameObject?.getComponent(Transform)
    if (transform) {
      this.body.setTranslation({ x: transform.position.x, y: transform.position.y, z: transform.position.z }, true)
      this.body.setRotation({ x: transform.rotation.x, y: transform.rotation.y, z: transform.rotation.z, w: transform.rotation.w }, true)
    }
  }

  update(dt: number): void {
    if (this.body.isFixed()) return

    const pos = this.body.translation()
    const rot = this.body.rotation()
    let transform = this.gameObject?.getComponent(Transform)
    if (transform) {
      transform.position.x = pos.x
      transform.position.y = pos.y
      transform.position.z = pos.z
      transform.rotation.x = rot.x
      transform.rotation.y = rot.y
      transform.rotation.z = rot.z
      transform.rotation.w = rot.w
    }
  }

  getBody(): RAPIER.RigidBody {
    return this.body
  }
}
