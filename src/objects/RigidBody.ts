import RAPIER from "@dimforge/rapier3d-compat"
import * as THREE from 'three'
import type { PhysicsWorld } from "../physics/physics"
import type { Updatable } from "./Updatable"

export class RigidBody implements Updatable {
  readonly body: RAPIER.RigidBody
  protected world: PhysicsWorld
  protected mesh: THREE.Object3D

  constructor(world: PhysicsWorld, body: RAPIER.RigidBody, mesh: THREE.Object3D) {
    this.world = world
    this.body = body
    this.mesh = mesh
  }

  update(dt: number): void {
    console.log("RigidBody update")
    if (this.body.isFixed()) return
    this.world.syncMesh(this.mesh, this.body)
  }
}
