import * as THREE from 'three'
import { scene } from '../main'
import { Component } from './Component';

export class AmbientLight extends Component {
  private light: THREE.AmbientLight
  public intensity: number = 1

  constructor() {
    super()
    this.light = null as unknown as THREE.AmbientLight
  }

  start(): void {
    this.light = new THREE.AmbientLight(0xffffff, this.intensity)
    scene.add(this.light)
  }

  update(dt: number): void {
  }
}

