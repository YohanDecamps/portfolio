import * as THREE from 'three'
import { eventQueue, input, scene, world } from '../main'
import type { GameObject } from '../components/GameObject'
import { loadScene, preloadJsonFiles } from './LoadScene'
import Stats from 'stats.js';

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
  
  clear() {
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(0), 3)
    )
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
  private stats: Stats;
  add(gameObject: GameObject) {
    this.gameObjects.push(gameObject)
  }

  constructor(renderer: THREE.WebGLRenderer, camera: THREE.Camera) {
    this.renderer = renderer
    this.camera = camera
    this.debugRenderer = new PhysicsDebugRenderer()
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms/frame, 2: memory
  }

  public findGameObjectById(id: string): GameObject | null {
    for (const go of this.gameObjects) {
      if (go.id === id) {
        return go
      }
    }
    return null
  }

  public findGameObjectsByTag(tag: string): GameObject[] {
    return this.gameObjects.filter(go => go.tags.includes(tag))
  }

  async loadScene(scenePath: string) {
    await preloadJsonFiles(scenePath)
    const loaded = await loadScene(scenePath)
    loaded.forEach(go => this.add(go))
  }

  start() {
    for (const u of this.gameObjects) {
      u.start()
    }
    this.loop()
  }

  private loop = () => {
    if (input.isKeyDown('KeyF')) {
      if (!document.body.contains(this.stats.dom)) {
        document.body.appendChild(this.stats.dom);
      }
    } else {
      if (document.body.contains(this.stats.dom)) {
        document.body.removeChild(this.stats.dom);
      }
    }
    this.stats.begin();
    requestAnimationFrame(this.loop)

    // Fixed-timestep physics, capped so a long stall (background tab, GC)
    // can't spiral into a catch-up loop.
    this.delta = Math.min(this.delta + this.clock.getDelta(), this.frameInterval * 4)
    const steps = Math.floor(this.delta / this.frameInterval)
    if (steps > 0) {
      this.delta -= steps * this.frameInterval
      for (let i = 0; i < steps; i++) {
        this.update(this.frameInterval)
      }
    }
    // Render on EVERY callback, decoupled from physics stepping. Gating the
    // render to 60Hz physics steps forces 60Hz content onto the display's
    // vsync grid: on a 144Hz panel that lands on alternating 2/3-vsync
    // boundaries (14/21ms), which reads as irregular frame intervals. Rendering
    // each callback lets the display cadence drive frame timing: constant
    // 16.67ms on 60Hz, constant vsync multiples on 120/144Hz.
    this.render()
    this.stats.end();
  }

  private update(dt: number) {
    world.step(eventQueue)
    if (input.isKeyDown('KeyF')) {
      this.debugRenderer.update()
    } else {
      this.debugRenderer.clear()
    }

    for (const u of this.gameObjects) {
      u.update(dt)
    }
  }

  private render() {
    this.renderer.render(scene, this.camera)
  }
}
