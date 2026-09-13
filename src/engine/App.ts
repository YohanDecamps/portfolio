import * as THREE from 'three'
import { eventQueue, input, scene, world } from '../main'
import type { GameObject } from '../components/GameObject'
import { loadScene, preloadJsonFiles } from './LoadScene'
import { Profiler } from '../lib/Profiler'
import Stats from 'stats.js';

export class PhysicsDebugRenderer {
  private geometry: THREE.BufferGeometry
  private material: THREE.LineBasicMaterial
  private mesh: THREE.LineSegments

  constructor() {

    this.geometry = new THREE.BufferGeometry()
    this.material = new THREE.LineBasicMaterial({ color: 0x00ff00 })
    this.mesh = new THREE.LineSegments(this.geometry, this.material)
    // Debug lines are camera-agnostic; and an empty geometry has no usable
    // bounding sphere, so don't let three.js try to cull it.
    this.mesh.frustumCulled = false
    this.mesh.visible = false

    scene.add(this.mesh)
  }

  update() {
    const debug = world.debugRender()

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(debug.vertices, 3)
    )

    this.geometry.computeBoundingSphere()
    this.mesh.visible = true
  }
  
  clear() {
    // Hiding is enough; previously this allocated an empty Float32Array +
    // BufferAttribute every frame while debug was off.
    this.mesh.visible = false
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
  private profiler = new Profiler()
  private debugEnabled = false
  private wasFDown = false
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
    // F toggles debug mode on/off (edge-triggered, not hold-to-show).
    const fDown = input.isKeyDown('KeyF')
    if (fDown && !this.wasFDown) {
      this.debugEnabled = !this.debugEnabled
      if (this.debugEnabled) {
        document.body.appendChild(this.stats.dom)
        this.profiler.show()
      } else {
        this.stats.dom.remove()
        this.profiler.hide()
      }
    }
    this.wasFDown = fDown

    const frameStart = performance.now()
    this.stats.begin();
    requestAnimationFrame(this.loop)

    this.delta = Math.min(this.delta + this.clock.getDelta(), this.frameInterval * 4)
    const steps = Math.floor(this.delta / this.frameInterval)
    if (steps > 0) {
      this.delta -= steps * this.frameInterval
      for (let i = 0; i < steps; i++) {
        this.update(this.frameInterval)
      }
    }
    this.render()
    this.profiler.recordFrame(performance.now() - frameStart)
    this.profiler.update()
    this.stats.end();
  }

  private update(dt: number) {
    const physicsStart = performance.now()
    world.step(eventQueue)
    this.profiler.record('physics', performance.now() - physicsStart)

    if (this.debugEnabled) {
      this.debugRenderer.update()
    } else {
      this.debugRenderer.clear()
    }

    for (const u of this.gameObjects) {
      const goStart = performance.now()
      u.update(dt)
      this.profiler.record(`GO ${u.id}`, performance.now() - goStart)
      this.profiler.meshStats(u)
    }
  }

  private render() {
    const renderStart = performance.now()
    this.renderer.render(scene, this.camera)
    this.profiler.record('render', performance.now() - renderStart)
    this.profiler.renderStats(this.renderer.info.render.calls, this.renderer.info.render.triangles)
  }
}
