import * as THREE from 'three'
import RAPIER, { RigidBodyDesc } from '@dimforge/rapier3d-compat'
import type { Updatable } from "./Updatable"
import { RigidBody } from './RigidBody'
import type { PhysicsWorld } from '../physics/physics'

export class Floor extends RigidBody implements Updatable {
  readonly object: THREE.Object3D

  constructor(object: THREE.Object3D, world: PhysicsWorld) {
    let body = world.world.createRigidBody( RigidBodyDesc.fixed()
                                           .setTranslation(0, -5, 0))
    const collider = RAPIER.ColliderDesc.cuboid(5, 0.5, 5)
    world.world.createCollider(collider, body)

    super(
      world,
      body,
      object
    )

    this.object = object
  }

  update(dt: number): void {
    super.update(dt)
  }
}
