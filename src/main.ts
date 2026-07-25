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
import { VehicleController } from './components/VehicleController'
import { loadGLB } from './lib/loadGLB'
import { PlayerMovementController } from './scripts/PlayerMovementController'

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

let vehicle: GameObject = new GameObject()

let vehicleRigidBodyComponent = new RigidBody()
vehicle.addComponent(vehicleRigidBodyComponent)

let vehicleBoxColliderComponent = new BoxCollider()
vehicleBoxColliderComponent.dimensions = {
  x: 0.9,
  y: 0.4,
  z: 2
}
vehicleBoxColliderComponent.position = {
  x: 0,
  y: 0.25,
  z: 0
}
vehicle.addComponent(vehicleBoxColliderComponent)

let vehicleMeshComponent = new Mesh()
const vehicleMesh = await loadGLB('/models/vehicule.glb')
vehicleMeshComponent.mesh = vehicleMesh
vehicle.addComponent(vehicleMeshComponent)

let vehicleControllerComponent = new VehicleController()
vehicleControllerComponent.wheels = [
  { x: 0.4, y: 0.2, z: -0.68 },
  { x: -0.4, y: 0.2, z: -0.68 },
  { x: 0.4, y: 0.2, z: 0.68 },
  { x: -0.4, y: 0.2, z: 0.68 }
]
vehicle.addComponent(vehicleControllerComponent)

let playerMovementControllerComponent = new PlayerMovementController()
vehicle.addComponent(playerMovementControllerComponent)

app.add(vehicle)

let followCameraComponent = new FollowCamera()
followCameraComponent.target = vehicle.getComponent(Transform)
followCameraComponent.offset = { x: 20, y: 20, z: 20 }
camera.addComponent(followCameraComponent)

let ground: GameObject = new GameObject()
let groundRigidBodyComponent = new RigidBody()
groundRigidBodyComponent.isDynamic = false
ground.getComponent(Transform)?.setPosition(0, -1, 0)
ground.addComponent(groundRigidBodyComponent)

let groundBoxColliderComponent = new BoxCollider()
groundBoxColliderComponent.dimensions = {
  x: 100,
  y: 1,
  z: 100
}
ground.addComponent(groundBoxColliderComponent)

let groundMeshComponent = new Mesh()
groundMeshComponent.mesh = await loadGLB('/models/ground.glb')
ground.addComponent(groundMeshComponent)

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
