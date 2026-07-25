
import * as THREE from 'three'
import { Component } from './Component'
import { Transform } from './Transform'
import { scene } from '../main'

export class Camera extends Component {
  private camera: THREE.OrthographicCamera
  
  constructor() {
    super()
    this.camera = new THREE.OrthographicCamera(
      window.innerWidth / -150,
      window.innerWidth / 150,
      window.innerHeight / 150,
      window.innerHeight / -150,
      -1000,
      1000
    )
  }

  start(): void {
    const transform = this.gameObject?.getComponent(Transform)
    if (transform) {
      this.camera.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z
      )
    }
    scene.add(this.camera)
    this.camera.updateProjectionMatrix()
  }

  update(dt: number): void {
    const transform = this.gameObject?.getComponent(Transform)
    if (transform && this.camera) {
      this.camera.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z
      )
      this.camera.updateProjectionMatrix()
    }
  }

  getCamera(): THREE.Camera {
    return this.camera
  }

  lookAt(x: number, y: number, z: number): void {
    if (this.camera) {
      this.camera.lookAt(x, y, z)
      this.camera.updateProjectionMatrix()
    }
  }
}

