import * as THREE from 'three'
import RAPIER, { RigidBodyDesc } from '@dimforge/rapier3d-compat'
import type { Updatable } from "./Updatable"
import { RigidBody } from './RigidBody'
import type { PhysicsWorld } from '../physics/physics'

export class Player extends RigidBody implements Updatable {
  readonly object: THREE.Object3D
  readonly cameraTarget: THREE.Object3D

  constructor(object: THREE.Object3D, world: PhysicsWorld) {
    let body = world.world.createRigidBody( RigidBodyDesc.dynamic().setTranslation(0, 0, 0) )
    const collider = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
    world.world.createCollider(collider, body)

    super(
      world,
      body,
      object
    )

    this.object = object
    this.cameraTarget = this.object.clone()
  }

  update(dt: number): void {
    this.cameraTarget.position.copy(this.object.position)
    super.update(dt)
  }
}
