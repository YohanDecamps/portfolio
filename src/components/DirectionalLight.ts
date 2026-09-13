import * as THREE from 'three'
import { app, scene } from '../main'
import { Camera } from './Camera';
import { Component } from './Component';
import { Transform } from './Transform';
import { VIEW_HEIGHT, groundFootprint } from '../lib/viewFrustum';

const _inv = new THREE.Matrix4()
const _corner = new THREE.Vector3()

export class DirectionalLight extends Component {
  private light: THREE.DirectionalLight
  private view: THREE.Camera | null = null
  public intensity: number = 1
  public color: number = 0xffffff
  public castShadow: boolean = true
  public viewHeight: number = VIEW_HEIGHT
  public shadowMargin: number = 1.2
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

    this.light.shadow.camera.near = 1
    this.light.shadow.camera.far = 100

    this.light.shadow.mapSize.width = 1024
    this.light.shadow.mapSize.height = 1024
    this.light.shadow.bias = -0.001

    this.light.shadow.radius = 5

    this.view = app.findGameObjectsByTag('camera')[0]?.getComponent(Camera)?.getCamera() ?? null

    scene.add(this.light)
  }

  update(dt: number): void {
    const transform = this.gameObject?.getComponent(Transform)
    if (!this.light || !transform) return

    const footprint = this.view ? groundFootprint(this.view, this.viewHeight) : null

    if (!footprint) {
      // No camera found: keep the configured placement.
      this.light.position.set(transform.position.x, transform.position.y, transform.position.z)
      this.light.target.position.set(
        transform.position.x + this.direction.x,
        transform.position.y + this.direction.y,
        transform.position.z + this.direction.z
      )
      this.light.target.updateMatrixWorld()
      return
    }

    const targetX = footprint.centerX
    const targetZ = footprint.centerZ

    this.light.target.position.set(targetX, 0, targetZ)
    this.light.position.set(
      targetX - this.direction.x,
      -this.direction.y,
      targetZ - this.direction.z
    )
    this.light.target.updateMatrixWorld()

    const shadowCam = this.light.shadow.camera
    shadowCam.position.copy(this.light.position)
    shadowCam.up.set(0, 1, 0)
    shadowCam.lookAt(this.light.target.position)
    shadowCam.updateMatrixWorld()
    _inv.copy(shadowCam.matrixWorld).invert()

    const acrossX = -footprint.forwardZ
    const acrossZ = footprint.forwardX
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

    for (let i = 0; i < 4; i++) {
      const sx = (i & 1) ? 1 : -1
      const sy = (i & 2) ? 1 : -1
      _corner.set(
        targetX + acrossX * sx * footprint.halfAcross + footprint.forwardX * sy * footprint.halfDepth,
        0,
        targetZ + acrossZ * sx * footprint.halfAcross + footprint.forwardZ * sy * footprint.halfDepth
      ).applyMatrix4(_inv)

      if (_corner.x < minX) minX = _corner.x
      if (_corner.x > maxX) maxX = _corner.x
      if (_corner.y < minY) minY = _corner.y
      if (_corner.y > maxY) maxY = _corner.y
    }

    const halfX = ((maxX - minX) / 2) * this.shadowMargin
    const halfY = ((maxY - minY) / 2) * this.shadowMargin
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    shadowCam.left = centerX - halfX
    shadowCam.right = centerX + halfX
    shadowCam.top = centerY + halfY
    shadowCam.bottom = centerY - halfY
    shadowCam.updateProjectionMatrix()
  }
}
