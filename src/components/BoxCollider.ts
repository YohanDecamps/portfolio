import { ColliderDesc } from "@dimforge/rapier3d-compat"
import { Component } from "./Component"
import { RigidBody } from "./RigidBody"
import { world } from "../main"

export class BoxCollider extends Component {
  private colliderDescription: ColliderDesc

  public dimensions: { x: number, y: number, z: number }
  
  constructor() {
    super()
    this.dimensions = { x: 1, y: 1, z: 1 }
    this.colliderDescription = null as unknown as ColliderDesc
  }

  start(): void {
    this.colliderDescription = ColliderDesc.cuboid(this.dimensions.x / 2, this.dimensions.y / 2, this.dimensions.z / 2)
    
    const rigidBody = this.gameObject?.getComponent(RigidBody)
    if (!rigidBody) {
      throw new Error("BoxCollider requires a RigidBody component")
    }
    world.createCollider(this.colliderDescription, rigidBody.getBody())
  }
}
