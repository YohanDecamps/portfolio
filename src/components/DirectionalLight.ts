import * as THREE from 'three'
import { scene } from '../main'
import { Component } from './Component';
import { Transform } from './Transform';

export class DirectionalLight extends Component {
  private light: THREE.DirectionalLight
  public intensity: number = 1
  public color: number = 0xffffff
  public castShadow: boolean = true
  public direction: { x: number, y: number, z: number } = { x: 0, y: -1, z: 0 }

  constructor() {
    super()
    this.light = null as unknown as THREE.DirectionalLight
  }

  start(): void {
    this.light = new THREE.DirectionalLight(this.color, this.intensity)

    const transform = this.gameObject?.getComponent(Transform)
    if (transform) {
      this.light.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z
      )
    }

    this.light.castShadow = true;

    const shadowCamSize = 30
    this.light.shadow.camera.left = -shadowCamSize
    this.light.shadow.camera.right = shadowCamSize
    this.light.shadow.camera.top = shadowCamSize
    this.light.shadow.camera.bottom = -shadowCamSize
    this.light.shadow.camera.near = 1
    this.light.shadow.camera.far = 1000

    this.light.shadow.mapSize.width = 2048
    this.light.shadow.mapSize.height = 2048
    this.light.shadow.bias = -0.0001

    scene.add(this.light)
  }

  update(dt: number): void {
    const transform = this.gameObject?.getComponent(Transform)
    if (transform && this.light) {
      this.light.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z
      )
      this.light.target.position.set(
        transform.position.x + this.direction.x,
        transform.position.y + this.direction.y,
        transform.position.z + this.direction.z
      )
      this.light.target.updateMatrixWorld()
    }
  }
}

