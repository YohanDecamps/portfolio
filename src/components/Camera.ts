import * as THREE from 'three'
import { Component } from './Component'
import { Transform } from './Transform'
import { VIEW_HEIGHT, viewHalfExtents } from '../lib/viewFrustum'
import { listener, scene } from '../main'

export class Camera extends Component {
  private camera: THREE.OrthographicCamera
  public viewHeight: number = VIEW_HEIGHT

  constructor() {
    super()
    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, 1, 300)
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
    this.camera.add( listener )
    this.updateProjection()

    window.addEventListener('resize', this.updateProjection)
  }

  public updateProjection = (): void => {
    const { halfWidth, halfHeight } = viewHalfExtents(this.viewHeight)

    this.camera.left = -halfWidth
    this.camera.right = halfWidth
    this.camera.top = halfHeight
    this.camera.bottom = -halfHeight
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
    }
  }

  getCamera(): THREE.Camera {
    return this.camera
  }

  lookAt(x: number, y: number, z: number): void {
    if (this.camera) {
      this.camera.lookAt(x, y, z)
    }
  }
}
