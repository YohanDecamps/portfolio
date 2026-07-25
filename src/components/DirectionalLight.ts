import * as THREE from 'three'
import { scene } from '../main'
import { Component } from './Component';
import { Transform } from './Transform';

export class DirectionalLight extends Component {
  private light: THREE.DirectionalLight
  public intensity: number = 1
  public castShadow: boolean = true

  constructor() {
    super()
    this.light = null as unknown as THREE.DirectionalLight
  }

  start(): void {
    this.light = new THREE.DirectionalLight(0xffffff, this.intensity)

    const transform = this.gameObject?.getComponent(Transform)
    if (transform) {
      this.light.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z
      )
    }

    this.light.castShadow = true;

    this.light.shadow.camera.left = -150
    this.light.shadow.camera.right = 150
    this.light.shadow.camera.top = 150
    this.light.shadow.camera.bottom = -150
    this.light.shadow.camera.near = 1.5
    this.light.shadow.camera.far = 150
    this.light.shadow.mapSize.width = 2048
    this.light.shadow.mapSize.height = 2048

    this.light.shadow.bias = -0.0001
    this.light.shadow.radius = 4
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
    }
  }
}

