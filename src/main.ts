import * as THREE from 'three'
import './style.css'
import { App } from './engine/App'
import { useRenderer } from './scene/renderer'
import RAPIER from '@dimforge/rapier3d-compat'
import { GameObject } from './components/GameObject'
import { Camera } from './components/Camera'
import { Transform } from './components/Transform'
import { AssetPool } from './engine/AssetPool'
import { LookAtPlayer } from './scripts/LookAtPlayer'
import { FollowPlayer } from './scripts/FollowPlayer'
import { InputManager } from './lib/InputManager'

await RAPIER.init()
export const input = new InputManager()
export const scene = new THREE.Scene()

export let world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0))
export const eventQueue: RAPIER.EventQueue = new RAPIER.EventQueue(true)

export const assetPool = new AssetPool()
await assetPool.loadAllAssets()

export const listener = new THREE.AudioListener();

export const audioLoader = new THREE.AudioLoader();

let camera: GameObject = new GameObject()
camera.tags.push('camera')
scene.background = new THREE.Color(0x87ceeb)
camera.getComponent(Transform)?.setPosition(20, 20, 20)
let cameraComponent = new Camera()
camera.addComponent(cameraComponent)
cameraComponent.start()

const view = await useRenderer(scene, cameraComponent.getCamera(), {
  focusDistance: 4,
  focalLength: 8,
  bokehScale: 4
})

export let app = new App(view)

cameraComponent.lookAt(0, 0, 0)
app.add(camera)

await app.loadScene('/scenes/scene.json')

let lookAtPlayerComponent = new LookAtPlayer()
lookAtPlayerComponent.offset = { x: 20, y: 20, z: 20 }
camera.addComponent(lookAtPlayerComponent)
let followPlayerComponent = new FollowPlayer()
followPlayerComponent.offset = { x: 20, y: 20, z: 20 }
camera.addComponent(followPlayerComponent)

app.start()
