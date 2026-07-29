import RAPIER, { RigidBodyDesc } from "@dimforge/rapier3d-compat"
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
  
  getColliders(): RAPIER.Collider[] {
    const colliders: RAPIER.Collider[] = []

    for (let i = 0; i < this.body.numColliders(); i++) {
      const collider = this.body.collider(i)
      if (collider) {
        colliders.push(collider)
      }
    }

    return colliders
  }

  setPosition(x: number, y: number, z: number): void {
    this.body.setTranslation({ x, y, z }, true)
    this.gameObject?.getComponent(Transform)?.setPosition(x, y, z)
  }

  setRotation(x: number, y: number, z: number, w: number): void {
    this.body.setRotation({ x, y, z, w }, true)
    this.gameObject?.getComponent(Transform)?.setRotation(x, y, z, w)
  }

  setLinearVelocity(x: number, y: number, z: number): void {
    this.body.setLinvel({ x, y, z }, true)
  }
  
  setAngularVelocity(x: number, y: number, z: number): void {
    this.body.setAngvel({ x, y, z }, true)
  }

  resetForces(): void {
    this.body.resetForces(true)
  }

  isCollidingWith(other: RigidBody): boolean {
    const collidersA = this.getColliders()
    const collidersB = other.getColliders()

    for (const colliderA of collidersA) {
      for (const colliderB of collidersB) {
        if (colliderA.contactCollider(colliderB, 0.01)) {
          return true
        }
      }
    }
    return false
  }
}
