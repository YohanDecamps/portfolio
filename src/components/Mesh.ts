import * as THREE from 'three'
import { Component } from './Component'
import { Transform } from './Transform'
import { assetPool, scene } from '../main'

export class Mesh extends Component {
  private mesh: THREE.Object3D
  public meshName: string = ''
  public isVisible: boolean = true
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  public rotation: { x: number, y: number, z: number, w: number } = { x: 0, y: 0, z: 0, w: 1 }
  public scale: { x: number, y: number, z: number } = { x: 1, y: 1, z: 1 }
  public castShadow: boolean = true
  public receiveShadow: boolean = true

  // Reused scratch objects so update() allocates nothing (per-frame GC pressure)
  private p = new THREE.Vector3()
  private q = new THREE.Quaternion()
  private offset = new THREE.Vector3()
  private worldPos = new THREE.Vector3()
  private rot = new THREE.Quaternion()
  private combined = new THREE.Quaternion()

  constructor() {
    super()
    this.mesh = null as unknown as THREE.Object3D
  }

  start(): void {
    if (this.meshName) {
      this.mesh = assetPool.getModel(this.meshName) || new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({ color: 0xff00ff })
      )
      this.mesh = this.mesh.clone()
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = this.castShadow
          child.receiveShadow = this.receiveShadow
        }
      })
      scene.add(this.mesh)
    } else {
      this.mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshPhongMaterial({ color: 0xff00ff })
      )
      scene.add(this.mesh)
    }
    this.mesh.receiveShadow = this.receiveShadow
    this.mesh.castShadow = this.castShadow
    this.mesh.visible = this.isVisible
  }

  update(dt: number): void {
    const transform = this.gameObject?.getComponent(Transform)

    if (transform && this.mesh) {
      this.p.set(transform.position.x, transform.position.y, transform.position.z)
      this.q.set(
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z,
        transform.rotation.w
      ).normalize()

      this.offset.set(this.position.x, this.position.y, this.position.z)
      this.offset.applyQuaternion(this.q)
      this.worldPos.copy(this.p).add(this.offset)
      this.mesh.position.copy(this.worldPos)

      this.rot.set(this.rotation.x, this.rotation.y, this.rotation.z, this.rotation.w)
      this.combined.multiplyQuaternions(this.q, this.rot)
      this.mesh.quaternion.copy(this.combined)
      this.mesh.scale.set(this.scale.x, this.scale.y, this.scale.z)
    }
    this.mesh.visible = this.isVisible
  }

  setVisibility(visible: boolean): void {
    this.isVisible = visible
    if (this.mesh) {
      this.mesh.visible = visible
    }
  }
}
