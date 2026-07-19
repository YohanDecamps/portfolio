import * as THREE from 'three'
import { loadGLB } from '../loadGLB'
import { Player } from '../objects/Player'
import type RAPIER from '@dimforge/rapier3d-compat'

export async function usePlayer(world: RAPIER.World, scene: THREE.Scene): Promise<Player> {
  const playerModel = await loadGLB('/models/vehicule.glb')
  
  const playerScale = 1
  playerModel.scale.set(playerScale, playerScale, -playerScale)
  playerModel.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true;
    }
  })
  
  const FRLightBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xFFD000 })
  )
  FRLightBulb.position.set(0.29, 0.2, 0.92)
  playerModel.add(FRLightBulb)
  const FLLightBulb = FRLightBulb.clone()
  FLLightBulb.position.set(-0.29, 0.2, 0.92)
  playerModel.add(FLLightBulb)
  
  const FRLightTarget = new THREE.Object3D()
  FRLightTarget.position.set(0.29, 0, 3)
  playerModel.add(FRLightTarget)
  const FRLight = new THREE.SpotLight(0xFFD000, 1, 5, Math.PI / 4, 0.5, 1)
  FRLight.position.set(0.29, 0.2, 0.92)
  FRLight.target = FRLightTarget
  playerModel.add(FRLight)
  
  const FLLightTarget = FRLightTarget.clone()
  FLLightTarget.position.set(-0.29, 0, 3)
  playerModel.add(FLLightTarget)
  const FLLight = FRLight.clone()
  FLLight.position.set(-0.29, 0.2, 0.92)
  FLLight.target = FLLightTarget
  playerModel.add(FLLight)
  
  const RLLightBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xFF0000 })
  )
  RLLightBulb.position.set(0.32, 0.16, -1.02)
  playerModel.add(RLLightBulb)
  
  const RLLight = new THREE.PointLight(0xFF0000, 1, 2, 2)
  RLLight.position.set(0.32, 0.16, -1.02)
  playerModel.add(RLLight)
  
  const RRLightBulb = RLLightBulb.clone()
  RRLightBulb.position.set(-0.32, 0.16, -1.02)
  playerModel.add(RRLightBulb)
  
  const RRLight = RLLight.clone()
  RRLight.position.set(-0.32, 0.16, -1.02)
  playerModel.add(RRLight)

  RLLight.intensity = 0
  RRLight.intensity = 0
  
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowDown') {
      RLLight.intensity = 1
      RRLight.intensity = 1
    }
  })
  
  window.addEventListener('keyup', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowDown') {
      RLLight.intensity = 0
      RRLight.intensity = 0
    }
  })

  scene.add(playerModel)
  let player = new Player(playerModel, world)
  return player
}
