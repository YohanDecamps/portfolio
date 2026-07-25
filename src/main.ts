import * as THREE from 'three'
import './style.css'
import { App } from './engine/App'
import { useRenderer } from './scene/renderer'
import RAPIER from '@dimforge/rapier3d-compat'
import { GameObject } from './components/GameObject'
import { AmbientLight } from './components/AmbientLight'
import { Camera } from './components/Camera'
import { Transform } from './components/Transform'
import { DirectionalLight } from './components/DirectionalLight'
import { AssetPool } from './engine/AssetPool'
import { FollowCamera } from './scripts/FollowCamera'

await RAPIER.init()
export const scene = new THREE.Scene()
export let world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0))

export const assetPool = new AssetPool()
await assetPool.loadAllAssets()

let camera: GameObject = new GameObject()
camera.getComponent(Transform)?.setPosition(20, 20, 20)
let cameraComponent = new Camera()
camera.addComponent(cameraComponent)
cameraComponent.start()

const renderer = useRenderer(cameraComponent.getCamera())

let app = new App(renderer, cameraComponent.getCamera())

cameraComponent.lookAt(0, 0, 0)
app.add(camera)

await app.loadScene('/scenes/scene.json')

let followCameraComponent = new FollowCamera()
followCameraComponent.target = app.findGameObjectById('vehicle')?.getComponent(Transform) || null
followCameraComponent.offset = { x: 20, y: 20, z: 20 }
camera.addComponent(followCameraComponent)

let ambientLight: GameObject = new GameObject()
let ambientLightComponent = new AmbientLight()
ambientLightComponent.intensity = 3
ambientLight.addComponent(ambientLightComponent)
app.add(ambientLight)
 
let directionalLight: GameObject = new GameObject()
let directionalLightComponent = new DirectionalLight()
directionalLightComponent.intensity = 3
directionalLight.getComponent(Transform)?.setPosition(10, 10, 10)
directionalLight.addComponent(directionalLightComponent)
app.add(directionalLight)

app.start()
