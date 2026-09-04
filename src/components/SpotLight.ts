
import * as THREE from 'three'
import { scene } from '../main'
import { Component } from './Component';
import { Transform } from './Transform';

export class SpotLight extends Component {
  private light: THREE.SpotLight
  public intensity: number = 1
  public color: number = 0xffffff
  public castShadow: boolean = false
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  public direction: { x: number, y: number, z: number } = { x: 0, y: -1, z: 0 }
  public angle: number = Math.PI / 8
  public penumbra: number = 0.1
  public decay: number = 1

  constructor() {
    super()
    this.light = null as unknown as THREE.SpotLight
  }

  start(): void {
    this.light = new THREE.SpotLight(this.color, this.intensity)

    const transform = this.gameObject?.getComponent(Transform)
    if (transform) {
      this.light.position.set(
        transform.position.x + this.position.x,
        transform.position.y + this.position.y,
        transform.position.z + this.position.z
      )
    }

    this.light.castShadow = this.castShadow
    this.light.angle = this.angle
    this.light.penumbra = this.penumbra
    this.light.decay = this.decay

    scene.add(this.light)
  }

  update(dt: number): void {
    const transform = this.gameObject?.getComponent(Transform)

    if (transform && this.light) {
      const transformPosition = new THREE.Vector3(
        transform.position.x,
        transform.position.y,
        transform.position.z
      )
      const transformRotation = new THREE.Quaternion(
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z,
        transform.rotation.w
      ).normalize()

      const localOffset = new THREE.Vector3(this.position.x, this.position.y, this.position.z)
      localOffset.applyQuaternion(transformRotation)

      const worldPosition = transformPosition.clone().add(localOffset)
      this.light.position.copy(worldPosition)

      const direction = new THREE.Vector3(this.direction.x, this.direction.y, this.direction.z)
      direction.applyQuaternion(transformRotation)
      this.light.target.position.copy(worldPosition.clone().add(direction))
      this.light.target.updateMatrixWorld()
    }
  }
}

