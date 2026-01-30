import * as THREE from 'three'
import './style.css'
import { App } from './App'
import { InputManager } from './InputManager'
import { FollowCameraController } from './scripts/FollowCameraController'
import { PlayerMovementController } from './scripts/PlayerMovementController'
import { PhysicsWorld } from './physics/physics'
import { useFloor } from './scene/floor'
import { useBowlingPins } from './scene/bowling-pins'
import { useLights } from './scene/lights'
import { usePlayer } from './scene/player'
import { useCamera } from './scene/camera'
import { useRenderer } from './scene/renderer'

const scene = new THREE.Scene()

const camera = useCamera() 
const renderer = useRenderer(camera)

const physicsWorld = new PhysicsWorld()
await physicsWorld.init()

let app = new App(renderer, scene, camera, physicsWorld)

app.add(useFloor(physicsWorld, scene))
app.add(await useBowlingPins(physicsWorld, scene))
useLights(scene)
let player = await usePlayer(physicsWorld, scene) 

let input = new InputManager()

app.add(player)
app.add(new FollowCameraController(camera, player.cameraTarget))
app.add(new PlayerMovementController(input, player))
app.start()
