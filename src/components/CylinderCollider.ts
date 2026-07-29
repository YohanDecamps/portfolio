import { ActiveEvents, ColliderDesc } from "@dimforge/rapier3d-compat"
import { Component } from "./Component"
import { RigidBody } from "./RigidBody"
import { world } from "../main"
import * as THREE from 'three'

export class CylinderCollider extends Component {
  private colliderDescription: ColliderDesc
  public height: number = 1
  public radius: number = 0.5
  public density: number = 1
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  public rotation: { x: number, y: number, z: number, w: number } = { x: 0, y: 0, z: 0, w: 1 }
  
  constructor() {
    super()
    this.colliderDescription = null as unknown as ColliderDesc
  }
  start(): void {
    this.colliderDescription = ColliderDesc.cylinder(this.height / 2, this.radius)
    this.colliderDescription.setDensity(this.density)
    this.colliderDescription.setTranslation(this.position.x, this.position.y, this.position.z)
    const q = new THREE.Quaternion(this.rotation.x, this.rotation.y, this.rotation.z, this.rotation.w).normalize()
    this.colliderDescription.setRotation(q)
    this.colliderDescription.setActiveEvents(ActiveEvents.COLLISION_EVENTS)
    
    const rigidBody = this.gameObject?.getComponent(RigidBody)
    if (!rigidBody) {
      throw new Error("CylinderCollider requires a RigidBody component")
    }
    world.createCollider(this.colliderDescription, rigidBody.getBody())
  }
}
