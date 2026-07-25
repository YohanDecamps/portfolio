import * as THREE from 'three'
import { scene, world } from './main'
import type { GameObject } from './components/GameObject'

export class PhysicsDebugRenderer {
  private geometry: THREE.BufferGeometry
  private material: THREE.LineBasicMaterial
  private mesh: THREE.LineSegments

  constructor() {

    this.geometry = new THREE.BufferGeometry()
    this.material = new THREE.LineBasicMaterial({ color: 0x00ff00 })
    this.mesh = new THREE.LineSegments(this.geometry, this.material)

    scene.add(this.mesh)
  }

  update() {
    const debug = world.debugRender()

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(debug.vertices, 3)
    )

    this.geometry.computeBoundingSphere()
  }
}

export class App {
  private clock = new THREE.Clock()
  private delta: number = 0
  private frameInterval: number = 1 / 60

  private renderer: THREE.WebGLRenderer
  private camera: THREE.Camera
  
  private gameObjects: GameObject[] = []
  
  private debugRenderer: PhysicsDebugRenderer
  add(gameObject: GameObject) {
    this.gameObjects.push(gameObject)
  }

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.renderer = renderer
    this.camera = camera
    this.debugRenderer = new PhysicsDebugRenderer()
  }

  start() {
    this.loop()
    for (const u of this.gameObjects) {
      u.start()
    }
  }

  private loop = () => {
    requestAnimationFrame(this.loop)
    this.delta += this.clock.getDelta()

    if (this.delta > this.frameInterval) {
      this.update(this.delta)
      this.render()

      this.delta = this.delta % this.frameInterval
    }
  }

  private update(dt: number) {
    world.step()
    this.debugRenderer.update()

    for (const u of this.gameObjects) {
      u.update(dt)
    }
  }

  private render() {
    this.renderer.render(scene, this.camera)
  }
}
