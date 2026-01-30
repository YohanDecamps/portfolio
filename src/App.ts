import * as THREE from 'three'
import type { Updatable } from './objects/Updatable'
import type { PhysicsWorld } from './physics/physics'
import RAPIER from '@dimforge/rapier3d-compat'

export class PhysicsDebugRenderer {
  private scene: THREE.Scene
  private world: RAPIER.World
  private geometry: THREE.BufferGeometry
  private material: THREE.LineBasicMaterial
  private mesh: THREE.LineSegments

  constructor(scene: THREE.Scene, world: RAPIER.World) {
    this.scene = scene
    this.world = world

    this.geometry = new THREE.BufferGeometry()
    this.material = new THREE.LineBasicMaterial({ color: 0x00ff00 })
    this.mesh = new THREE.LineSegments(this.geometry, this.material)

    this.scene.add(this.mesh)
  }

  update() {
    const debug = this.world.debugRender()

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(debug.vertices, 3)
    )

    this.geometry.computeBoundingSphere()
  }
}

export class App {
  private clock = new THREE.Clock()

  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.Camera
  private physicsWorld: PhysicsWorld
  
  private updatables: Updatable[] = []
  
  private debugRenderer: PhysicsDebugRenderer
  add(updatable: Updatable) {
    this.updatables.push(updatable)
  }

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, physicsWorld: PhysicsWorld
  ) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.physicsWorld = physicsWorld
    this.debugRenderer = new PhysicsDebugRenderer(this.scene, this.physicsWorld.world)
  }

  start() {
    this.loop()
  }

  private loop = () => {
    const delta = this.clock.getDelta()

    this.update(delta)
    this.render()

    requestAnimationFrame(this.loop)
  }

  private update(dt: number) {
    this.physicsWorld.step(dt)
    this.debugRenderer.update()

    for (const u of this.updatables) {
      u.update(dt)
    }
  }

  private render() {
    this.renderer.render(this.scene, this.camera)
  }
}
