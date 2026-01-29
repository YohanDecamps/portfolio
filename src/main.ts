import * as THREE from 'three'
import './style.css'
import { App } from './App'
import { Player } from './objects/Player'
import { InputManager } from './InputManager'
import { FollowCameraController } from './scripts/FollowCameraController'
import { PlayerMovementController } from './scripts/PlayerMovementController'
import { PhysicsWorld } from './physics/physics'
import { Floor } from './objects/Floor'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera(
  window.innerWidth / -150,
  window.innerWidth / 150,
  window.innerHeight / 150,
  window.innerHeight / -150,
  -1000,
  1000
)

camera.position.z = 20
camera.position.y = 20
camera.position.x = 20

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

  camera.left = width / -150
  camera.right = width / 150
  camera.top = height / 150
  camera.bottom = height / -150
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

export function loadGLB(url: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(url, gltf => resolve(gltf.scene), undefined, reject)
  })
}

const playerModel = await loadGLB('/models/tank.glb')

playerModel.scale.set(1, 1, 1)
playerModel.traverse(obj => {
  if ((obj as THREE.Mesh).isMesh) {
    obj.castShadow = true
    obj.receiveShadow = true
    // give player model green color
    ;(obj as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color: 0x4B5320 })
  }
})

const floorGeometry = new THREE.BoxGeometry(100, 0.1, 100)
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
floorMesh.receiveShadow = true;
// add texture to floor
const textureLoader = new THREE.TextureLoader()
const floorTexture = textureLoader.load('/textures/checkerboard.png')
floorTexture.wrapS = THREE.RepeatWrapping
floorTexture.wrapT = THREE.RepeatWrapping
floorTexture.repeat.set(20, 20)
floorMaterial.map = floorTexture
floorMaterial.needsUpdate = true

scene.add(floorMesh)

scene.add(playerModel)

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

let player = new Player(playerModel, physicsWorld)
let floor = new Floor(floorMesh, physicsWorld)

let followCamera = new FollowCameraController(camera, player.cameraTarget)
let playerMovement = new PlayerMovementController(input, player)

app.add(player)
app.add(floor)
app.add(playerMovement)
app.add(followCamera)
app.start()
