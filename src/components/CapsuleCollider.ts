import { ColliderDesc } from "@dimforge/rapier3d-compat"
import { Component } from "./Component"
import { RigidBody } from "./RigidBody"
import { world } from "../main"

export class CapsuleCollider extends Component {
  private colliderDescription: ColliderDesc

  public height: number = 1
  public radius: number = 0.5
  public density: number = 1
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  
  constructor() {
    super()
    this.colliderDescription = null as unknown as ColliderDesc
  }

  start(): void {
    this.colliderDescription = ColliderDesc.capsule(this.height / 2, this.radius)
    this.colliderDescription.setDensity(this.density)
    this.colliderDescription.setTranslation(this.position.x, this.position.y, this.position.z)
    
    const rigidBody = this.gameObject?.getComponent(RigidBody)
    if (!rigidBody) {
      throw new Error("CapsuleCollider requires a RigidBody component")
    }
    world.createCollider(this.colliderDescription, rigidBody.getBody())
  }
}
