import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'

export class PhysicsWorld {
  world!: RAPIER.World
  gravity = new RAPIER.Vector3(0, -9.81, 0)

  constructor() {}

  async init() {
    await RAPIER.init()
    this.world = new RAPIER.World(this.gravity)
  }

  step(dt: number) {
    this.world.step()
  }

  syncMesh(mesh: THREE.Object3D, body: RAPIER.RigidBody) {
    const pos = body.translation()
    const rot = body.rotation()
    mesh.position.set(pos.x, pos.y, pos.z)
    mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)
  }
}
