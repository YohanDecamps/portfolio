import * as THREE from 'three'
import './style.css'
import { App } from './App'
import { useRenderer } from './scene/renderer'
import RAPIER from '@dimforge/rapier3d-compat'
import { GameObject } from './components/GameObject'
import { Mesh } from './components/Mesh'
import { AmbientLight } from './components/AmbientLight'
import { RigidBody } from './components/RigidBody'
import { BoxCollider } from './components/BoxCollider'
import { Camera } from './components/Camera'
import { Transform } from './components/Transform'
import { FollowCamera } from './scripts/FollowCamera'
import { DirectionalLight } from './components/DirectionalLight'

await RAPIER.init()
export const scene = new THREE.Scene()
export let world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0))

let camera: GameObject = new GameObject()
camera.getComponent(Transform)?.setPosition(20, 0, 0)
let cameraComponent = new Camera()
camera.addComponent(cameraComponent)
cameraComponent.start()

const renderer = useRenderer(cameraComponent.getCamera())

let app = new App(renderer, cameraComponent.getCamera())

app.add(camera)

let vehicule: GameObject = new GameObject()

let vehiculeMeshComponent = new Mesh()
vehiculeMeshComponent.meshPath = '/models/vehicule.glb'
vehicule.addComponent(vehiculeMeshComponent)

let vehiculeRigidBodyComponent = new RigidBody()
vehicule.addComponent(vehiculeRigidBodyComponent)

let vehiculeBoxColliderComponent = new BoxCollider()
vehiculeBoxColliderComponent.dimensions = {
  x: 1,
  y: 1,
  z: 2
}
vehicule.addComponent(vehiculeBoxColliderComponent)

app.add(vehicule)

let followCameraComponent = new FollowCamera()
followCameraComponent.target = vehicule.getComponent(Transform)
followCameraComponent.offset = { x: 20, y: 20, z: 20 }
camera.addComponent(followCameraComponent)

let ground: GameObject = new GameObject()
let groundRigidBodyComponent = new RigidBody()
groundRigidBodyComponent.isDynamic = false
ground.getComponent(Transform)?.setPosition(0, -3, 0)
ground.addComponent(groundRigidBodyComponent)

let groundBoxColliderComponent = new BoxCollider()
groundBoxColliderComponent.dimensions = {
  x: 10,
  y: 1,
  z: 10
}
ground.addComponent(groundBoxColliderComponent)

app.add(ground)

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
