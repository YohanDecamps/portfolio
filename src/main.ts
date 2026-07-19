import * as THREE from 'three'
import './style.css'
import { App } from './App'
import { InputManager } from './InputManager'
import { FollowCameraController } from './scripts/FollowCameraController'
import { PlayerMovementController } from './scripts/PlayerMovementController'
import { useFloor } from './scene/floor'
import { useBowlingPins } from './scene/bowling-pins'
import { useLights } from './scene/lights'
import { usePlayer } from './scene/player'
import { useCamera } from './scene/camera'
import { useRenderer } from './scene/renderer'
import RAPIER from '@dimforge/rapier3d-compat'
import { useScene } from './scene/scene'

const scene = new THREE.Scene()

const camera = useCamera() 
const renderer = useRenderer(camera)

await RAPIER.init()
let world = new RAPIER.World(new RAPIER.Vector3(0, -9.81, 0))

let app = new App(renderer, scene, camera, world)

app.add(useFloor(world, scene))
let bowlingPins = await useBowlingPins(world, scene)
bowlingPins.forEach(pin => app.add(pin))
useLights(scene)
useScene(world, scene)
let player = await usePlayer(world, scene) 

let input = new InputManager()

app.add(player)
app.add(new FollowCameraController(camera, player.cameraTarget))
app.add(new PlayerMovementController(input, player))
app.start()
