import { GameObject } from "../objects/GameObject";
import * as THREE from 'three'
import RAPIER from "@dimforge/rapier3d-compat"
import { Mesh } from "../objects/Mesh";
import { RigidBody } from "../objects/RigidBody";

export function useFloor(world: RAPIER.World, scene: THREE.Scene): GameObject {
  const floorGeometry = new THREE.BoxGeometry(99999, 1, 99999).translate(0, -0.5, 0)
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
  floorMesh.receiveShadow = true;
  
  const textureLoader = new THREE.TextureLoader()
  const floorTexture = textureLoader.load('/textures/checkerboard.png')
  floorTexture.wrapS = THREE.RepeatWrapping
  floorTexture.wrapT = THREE.RepeatWrapping
  floorTexture.repeat.set(9999, 9999)
  floorMaterial.map = floorTexture
  floorMaterial.normalScale = new THREE.Vector2(1, 1)
  floorMaterial.needsUpdate = true

  let floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
  const floorCollider = RAPIER.ColliderDesc.cuboid(99999, 0.5, 99999).setTranslation(0, -0.5, 0)
  world.createCollider(floorCollider, floorBody)
  const floorRigidBody = new RigidBody(floorBody, floorMesh)
  
  let floor = new GameObject()
  floor.addComponent(floorRigidBody)
  floor.addComponent(new Mesh(floorMesh, scene))

  return floor
}

