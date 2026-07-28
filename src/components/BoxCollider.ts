import { ActiveEvents, ColliderDesc } from "@dimforge/rapier3d-compat"
import { Component } from "./Component"
import { RigidBody } from "./RigidBody"
import { world } from "../main"

export class BoxCollider extends Component {
  private colliderDescription: ColliderDesc

  public isSensor: boolean = false
  public dimensions: { x: number, y: number, z: number }
  public density: number = 1
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  
  constructor() {
    super()
    this.dimensions = { x: 1, y: 1, z: 1 }
    this.colliderDescription = null as unknown as ColliderDesc
  }

  start(): void {
    this.colliderDescription = ColliderDesc.cuboid(this.dimensions.x / 2, this.dimensions.y / 2, this.dimensions.z / 2)
    this.colliderDescription.setDensity(this.density)
    this.colliderDescription.setTranslation(this.position.x, this.position.y, this.position.z)
    this.colliderDescription.setSensor(this.isSensor)
    this.colliderDescription.setActiveEvents(ActiveEvents.CONTACT_FORCE_EVENTS) // Enable all events (collision, contact force, etc.)
    
    const rigidBody = this.gameObject?.getComponent(RigidBody)
    if (!rigidBody) {
      throw new Error("BoxCollider requires a RigidBody component")
    }
    world.createCollider(this.colliderDescription, rigidBody.getBody())
  }
}
