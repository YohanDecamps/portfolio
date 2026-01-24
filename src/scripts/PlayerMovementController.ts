import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import type { Updatable } from '../objects/Updatable'
import type { InputManager } from '../InputManager'

export class PlayerMovementController implements Updatable {
  private playerObject: THREE.Object3D
  private body: RAPIER.RigidBody
  private world: RAPIER.World
  private input: InputManager
  private camera: THREE.Camera

  constructor(playerObject: THREE.Object3D, input: InputManager, camera: THREE.Camera, world: RAPIER.World
  ) {
    this.playerObject = playerObject
    this.input = input
    this.camera = camera
    this.world = world
    this.body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic())
    const collider = RAPIER.ColliderDesc.capsule(0.5, 1)
    world.createCollider(collider, this.body)
  }

  update(dt: number) {
  }
}
