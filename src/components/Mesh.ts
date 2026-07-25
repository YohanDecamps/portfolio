import * as THREE from 'three'
import { Component } from './Component'
import { loadGLB } from '../loadGLB'
import { Transform } from './Transform'
import { scene } from '../main'

export class Mesh extends Component {
  private mesh: THREE.Object3D
  public meshPath: string = ""

  constructor() {
    super()
    this.mesh = null as unknown as THREE.Object3D
  }

  start(): void {
    if (this.meshPath) {
      loadGLB(this.meshPath).then((gltf) => {
        this.mesh = gltf
        scene.add(this.mesh)
      }).catch((error) => {
        console.error("Error loading GLB file:", error)
      })
    } else {
      this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      )
      scene.add(this.mesh)
    }
  }

  update(dt: number): void {
    const transform = this.gameObject?.getComponent(Transform)
    if (transform && this.mesh) {
      this.mesh.position.copy(transform.position)
      this.mesh.quaternion.copy(transform.rotation)
    }
  }
}
