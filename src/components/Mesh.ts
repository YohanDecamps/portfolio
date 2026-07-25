import * as THREE from 'three'
import { Component } from './Component'
import { Transform } from './Transform'
import { scene } from '../main'

export class Mesh extends Component {
  public mesh: THREE.Object3D
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  public rotation: { x: number, y: number, z: number, w: number } = { x: 0, y: 0, z: 0, w: 1 }

  constructor() {
    super()
    this.mesh = null as unknown as THREE.Object3D
  }

  start(): void {
    if (this.mesh) {
        scene.add(this.mesh)
    } else {
      this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xff00ff })
      )
      scene.add(this.mesh)
    }
  }

  update(dt: number): void {
  const transform = this.gameObject?.getComponent(Transform)
  if (transform && this.mesh) {
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
    )

    const localOffset = new THREE.Vector3(this.position.x, this.position.y, this.position.z)
    localOffset.applyQuaternion(transformRotation)

    const worldPosition = transformPosition.clone().add(localOffset)
    this.mesh.position.copy(worldPosition)

    const additionalRotation = new THREE.Quaternion(
      this.rotation.x,
      this.rotation.y,
      this.rotation.z,
      this.rotation.w
    )
    this.mesh.quaternion.copy(transformRotation.clone().multiply(additionalRotation))
  }
  }
}
