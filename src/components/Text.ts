import * as THREE from 'three'
import { Component } from './Component'
import { Transform } from './Transform'
import { assetPool, scene } from '../main'

export class Text extends Component {
  public font = 'adwaita'         // now treated as a CSS font-family name
  public text = ''
  public size = 1                 // world-space height of the text
  public lineHeight = 1.8         // line spacing as a multiple of font size
  public color = '#ffffff'
  public isVisible: boolean = true
  public position: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 }
  public rotation: { x: number, y: number, z: number, w: number } = { x: 0, y: 0, z: 0, w: 1 }
  public scale: { x: number, y: number, z: number } = { x: 1, y: 1, z: 1 }
  public castShadow: boolean = false
  public receiveShadow: boolean = true

  private mesh: THREE.Mesh | null = null
  private canvas: HTMLCanvasElement | null = null
  private texture: THREE.CanvasTexture | null = null
  private lastText = ''

  constructor() {
    super()
  }

  start(): void {
    this.buildTextMesh()
  }

  /** Rebuilds the canvas texture + plane. Call again if `text`, `font`, `color`, or `lineHeight` change at runtime. */
  private buildTextMesh(): void {
    const fontFamily = assetPool.getFont(this.font)?.data.familyName
    const lines = this.text.split('\n')
  
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const fontPx = 30
    const lineHeightPx = fontPx * this.lineHeight
  
    ctx.font = `${fontPx}px ${fontFamily}`
  
    let maxWidth = 0
    for (const line of lines) {
      const w = ctx.measureText(line).width
      if (w > maxWidth) maxWidth = w
    }
  
    canvas.width = Math.max(1, Math.ceil(maxWidth))
    canvas.height = Math.max(1, Math.ceil(lineHeightPx * lines.length))
  
    ctx.font = `${fontPx}px ${fontFamily}`
    ctx.textBaseline = 'middle'
    ctx.fillStyle = this.color
  
    lines.forEach((line, i) => {
      const y = lineHeightPx * i + lineHeightPx / 2
      ctx.fillText(line, 0, y)
    })
  
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    texture.minFilter = THREE.LinearFilter
  
    // Map pixels to world units so `fontPx` pixels always equals `this.size` world units,
    // regardless of lineHeight or line count.
    const worldUnitsPerPixel = this.size / fontPx
    const planeWidth = canvas.width * worldUnitsPerPixel
    const planeHeight = canvas.height * worldUnitsPerPixel
  
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
    geometry.translate(planeWidth / 2, -planeHeight / 2, 0)
  
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.01,
      side: THREE.DoubleSide,
    })
  
    if (this.mesh) {
      scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      ;(this.mesh.material as THREE.Material).dispose()
    }
    this.texture?.dispose()
  
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = this.castShadow
    mesh.receiveShadow = this.receiveShadow
    mesh.visible = this.isVisible
    scene.add(mesh)
  
    this.mesh = mesh
    this.canvas = canvas
    this.texture = texture
    this.lastText = this.text
  }
  update(dt: number): void {
    // Rebuild texture only if text content changed since last frame
    if (this.text !== this.lastText) {
      this.buildTextMesh()
    }
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
      this.mesh.visible = this.isVisible
    }
  }

  setVisibility(visible: boolean): void {
    this.isVisible = visible
    if (this.mesh) {
      this.mesh.visible = visible
    }
  }
}
