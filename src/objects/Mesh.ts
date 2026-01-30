import * as THREE from 'three'
import type { Updatable } from './Updatable'

export class Mesh implements Updatable {
  private mesh: THREE.Object3D

  constructor(mesh: THREE.Object3D, scene: THREE.Scene) {
    scene.add(mesh)
    this.mesh = mesh
  }

  update(dt: number): void {
  }
}
