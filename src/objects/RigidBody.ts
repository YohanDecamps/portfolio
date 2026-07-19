import RAPIER from "@dimforge/rapier3d-compat"
import * as THREE from 'three'
import type { Updatable } from "./Updatable"

export class RigidBody implements Updatable {
  readonly body: RAPIER.RigidBody
  protected mesh: THREE.Object3D

  constructor(body: RAPIER.RigidBody, mesh: THREE.Object3D) {
    this.body = body
    this.mesh = mesh
  }

  update(dt: number): void {
    console.log("RigidBody update")
    if (this.body.isFixed()) return
    const pos = this.body.translation()
    const rot = this.body.rotation()
    this.mesh.position.set(pos.x, pos.y, pos.z)
    this.mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)
  }
}
