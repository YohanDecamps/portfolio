import RAPIER from "@dimforge/rapier3d-compat"
import * as THREE from 'three'
import type { PhysicsWorld } from "../physics/physics"

export abstract class RigidBody {
  protected body: RAPIER.RigidBody
  protected world: PhysicsWorld
  protected mesh: THREE.Object3D

  constructor(world: PhysicsWorld, body: RAPIER.RigidBody, mesh: THREE.Object3D) {
    this.world = world
    this.body = body
    this.mesh = mesh
  }

  update(dt: number): void {
    this.world.syncMesh(this.mesh, this.body)
  }
}
