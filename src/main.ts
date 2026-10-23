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

const loadingScreen = document.getElementById('loading-screen')!
const loadingBarFill = document.getElementById('loading-bar-fill')!
const loadingText = document.getElementById('loading-text')!

function setProgress(percent: number, text: string) {
  loadingBarFill.style.width = `${Math.min(100, Math.max(0, percent))}%`
  loadingText.textContent = text
}

window.addEventListener('unhandledrejection', () => {
  if (!loadingScreen.classList.contains('hidden')) {
    setProgress(100, 'Failed to load. See console.')
  }
})

setProgress(5, 'Initializing physics...')
await RAPIER.init()
setProgress(10, 'Loading assets...')
export const input = new InputManager()
export const scene = new THREE.Scene()

export let world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0))
export const eventQueue: RAPIER.EventQueue = new RAPIER.EventQueue(true)

export const assetPool = new AssetPool()
await assetPool.loadAllAssets((loaded, total) => {
  setProgress(10 + (loaded / total) * 80, `Loading assets... ${loaded}/${total}`)
})
setProgress(90, 'Preparing scene...')

export const listener = new THREE.AudioListener();

export const audioLoader = new THREE.AudioLoader();

let camera: GameObject = new GameObject()
camera.tags.push('camera')
scene.background = new THREE.Color(0x87ceeb)
camera.getComponent(Transform)?.setPosition(20, 20, 20)
let cameraComponent = new Camera()
camera.addComponent(cameraComponent)
cameraComponent.start()

const renderer = useRenderer()

export let app = new App(renderer, cameraComponent.getCamera())

cameraComponent.lookAt(0, 0, 0)
app.add(camera)

await app.loadScene('/scenes/scene.json')
setProgress(98, 'Starting...')

let lookAtPlayerComponent = new LookAtPlayer()
lookAtPlayerComponent.offset = { x: 20, y: 20, z: 20 }
camera.addComponent(lookAtPlayerComponent)
let followPlayerComponent = new FollowPlayer()
followPlayerComponent.offset = { x: 20, y: 20, z: 20 }
camera.addComponent(followPlayerComponent)

app.start()

setProgress(100, 'Ready')
setTimeout(() => {
  loadingScreen.classList.add('hidden')
  setTimeout(() => loadingScreen.remove(), 400)
}, 300)
