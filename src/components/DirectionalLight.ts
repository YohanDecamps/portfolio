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

