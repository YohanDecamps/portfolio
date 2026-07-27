
import { ColliderDesc } from "@dimforge/rapier3d-compat"
import { Component } from "./Component"
import { RigidBody } from "./RigidBody"
import { world } from "../main"

export class SphereCollider extends Component {
  private colliderDescription: ColliderDesc

  public radius: number = 1
  public density: number = 1
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  
  constructor() {
    super()
    this.colliderDescription = null as unknown as ColliderDesc
  }

  start(): void {
    this.colliderDescription = ColliderDesc.ball(this.radius)
    this.colliderDescription.setDensity(this.density)
    this.colliderDescription.setTranslation(this.position.x, this.position.y, this.position.z)
    
    const rigidBody = this.gameObject?.getComponent(RigidBody)
    if (!rigidBody) {
      throw new Error("SphereCollider requires a RigidBody component")
    }
    world.createCollider(this.colliderDescription, rigidBody.getBody())
  }
}
