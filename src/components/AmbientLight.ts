import * as THREE from 'three'
import { scene } from '../main'
import { Component } from './Component';

export class AmbientLight extends Component {
  private light: THREE.AmbientLight
  public color: number = 0xffffff
  public intensity: number = 1

  constructor() {
    super()
    this.light = null as unknown as THREE.AmbientLight
  }

  start(): void {
    this.light = new THREE.AmbientLight(this.color, this.intensity)
    scene.add(this.light)
  }

  update(dt: number): void {
  }
}

