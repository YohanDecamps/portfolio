import * as THREE from 'three'
import { Component } from './Component'
import { Transform } from './Transform'
import { assetPool, scene } from '../main'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export class Text extends Component {
  public font = 'adwaita'
  public text = ''
  public size = 1
  public depth = 0.1

  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  public rotation: { x: number, y: number, z: number, w: number } = { x: 0, y: 0, z: 0, w: 1 }
  public scale: { x: number, y: number, z: number } = { x: 1, y: 1, z: 1 }
  public castShadow: boolean = true
  public receiveShadow: boolean = true

  private mesh: THREE.Mesh | null = null

  constructor() {
    super()
  }

  start(): void {
    const font = assetPool.getFont(this.font)
    if (!font) {
      console.error(`Font ${this.font} not found in asset pool.`)
      return
    }

    const geometry = new TextGeometry(this.text, {
      font: font,
      size: this.size,
      depth: this.depth,
      curveSegments: 1,
      bevelEnabled: false,
    })

    const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = this.castShadow
    mesh.receiveShadow = this.receiveShadow

    scene.add(mesh)
    this.mesh = mesh
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
      ).normalize()

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
      this.mesh.scale.set(this.scale.x, this.scale.y, this.scale.z)
    }
  }
}
