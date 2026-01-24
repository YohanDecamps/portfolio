import * as THREE from 'three'
import './style.css'
import { App } from './App'
import { Player } from './objects/Player'
import { InputManager } from './InputManager'
import { FollowCameraController } from './scripts/FollowCameraController'
import { PlayerMovementController } from './scripts/PlayerMovementController'
import { PhysicsWorld } from './physics/physics'
import { Floor } from './objects/Floor'

const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera(
  window.innerWidth / -200,
  window.innerWidth / 200,
  window.innerHeight / 200,
  window.innerHeight / -200,
  -1000,
  1000
)

camera.position.z = 10
camera.position.y = 10
camera.position.x = 10

camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement)
renderer.domElement.style.display = 'block'

window.addEventListener('resize', () => {
  const width = window.innerWidth
  const height = window.innerHeight

  camera.left = width / -200
  camera.right = width / 200
  camera.top = height / 200
  camera.bottom = height / -200
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0xff5555 })
const playerMesh = new THREE.Mesh(geometry, material)
playerMesh.castShadow = true;

const floorGeometry = new THREE.BoxGeometry(10, 0.1, 10)
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
floorMesh.receiveShadow = true;

scene.add(floorMesh)

scene.add(playerMesh)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(1, 3, 2)
light.castShadow = true;
scene.add(light)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
scene.add(ambientLight)

const physicsWorld = new PhysicsWorld()
await physicsWorld.init()

let input = new InputManager()

let app = new App(renderer, scene, camera, physicsWorld)

let player = new Player(playerMesh, physicsWorld)
let floor = new Floor(floorMesh, physicsWorld)

let followCamera = new FollowCameraController(camera, player.cameraTarget)

app.add(player)
app.add(floor)
app.add(followCamera)
app.start()
