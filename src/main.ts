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
import RAPIER from '@dimforge/rapier3d-compat'
import { RigidBody } from './objects/RigidBody'

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
renderer.shadowMap.type = THREE.PCFShadowMap

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

const playerModel = await loadGLB('/models/vehicule.glb')

const playerScale = 1
playerModel.scale.set(playerScale, playerScale, -playerScale)
playerModel.traverse((child) => {
  if ((child as THREE.Mesh).isMesh) {
    const mesh = child as THREE.Mesh
    mesh.castShadow = true;
  }
})

const floorGeometry = new THREE.BoxGeometry(99999, 0.1, 99999)
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
floorMesh.receiveShadow = true;

const textureLoader = new THREE.TextureLoader()
const floorTexture = textureLoader.load('/textures/checkerboard.png')
floorTexture.wrapS = THREE.RepeatWrapping
floorTexture.wrapT = THREE.RepeatWrapping
floorTexture.repeat.set(9999, 9999)
floorMaterial.map = floorTexture
floorMaterial.needsUpdate = true


scene.add(floorMesh)

scene.add(playerModel)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(1, 3, 2)

light.castShadow = true;
light.shadow.camera.left = -150
light.shadow.camera.right = 150
light.shadow.camera.top = 150
light.shadow.camera.bottom = -150
light.shadow.camera.near = 1.5
light.shadow.camera.far = 150

light.shadow.mapSize.width = 2048
light.shadow.mapSize.height = 2048

light.shadow.bias = -0.0001
light.shadow.radius = 3
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

let cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
let cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF })

for (let i = 0; i < 6; i++) {
  let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
  cubeMesh.position.set(
    0,
    i * 0.5,
    -3
  )
  cubeMesh.castShadow = true;
  scene.add(cubeMesh)

  let cubeBody = physicsWorld.world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(
        cubeMesh.position.x,
        cubeMesh.position.y,
        cubeMesh.position.z
      )
  )
  
  let rigidBody = new RigidBody(physicsWorld, cubeBody, cubeMesh)
  
  app.add(rigidBody)
  let cubeCollider = RAPIER.ColliderDesc.cuboid(0.25, 0.25, 0.25)
  physicsWorld.world.createCollider(cubeCollider, cubeBody)
}

app.add(player)
app.add(floor)
app.add(playerMovement)
app.add(followCamera)
app.start()
