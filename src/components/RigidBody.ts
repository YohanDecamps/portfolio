import RAPIER from "@dimforge/rapier3d-compat"
import { Component } from "./Component"
import { Transform } from "./Transform"
import { world } from "../main"

export class RigidBody extends Component {
  private body: RAPIER.RigidBody
  private transform: Transform | null | undefined = null
  public isDynamic: boolean = true
  public canSleep: boolean = true

  constructor() {
    super()
    this.body = null as unknown as RAPIER.RigidBody
  }

  start(): void {
    const desc = (this.isDynamic
      ? RAPIER.RigidBodyDesc.dynamic()
      : RAPIER.RigidBodyDesc.fixed()
    ).setCanSleep(this.canSleep)
    this.body = world.createRigidBody(desc)
    this.transform = this.gameObject?.getComponent(Transform)
    if (this.transform) {
      this.body.setTranslation({ x: this.transform.position.x, y: this.transform.position.y, z: this.transform.position.z }, true)
      this.body.setRotation({ x: this.transform.rotation.x, y: this.transform.rotation.y, z: this.transform.rotation.z, w: this.transform.rotation.w }, true)
    }
  }

  update(dt: number): void {
    if (this.body.isFixed()) return

    const startTime = performance.now()
    const pos = this.body.translation()
    const rot = this.body.rotation()
    const endTime = performance.now()
    if (endTime - startTime > 1) {
      console.warn(`RigidBody update took ${endTime - startTime} ms`)
    }
    if (this.transform) {
      this.transform.position.x = pos.x
      this.transform.position.y = pos.y
      this.transform.position.z = pos.z
      this.transform.rotation.x = rot.x
      this.transform.rotation.y = rot.y
      this.transform.rotation.z = rot.z
      this.transform.rotation.w = rot.w
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

  setDynamic(isDynamic: boolean): void {
    if (this.isDynamic !== isDynamic) {
      this.isDynamic = isDynamic
      this.body.setBodyType(isDynamic ? RAPIER.RigidBodyType.Dynamic : RAPIER.RigidBodyType.Fixed, true)
    }
  }
}
