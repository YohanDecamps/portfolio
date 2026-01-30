import * as THREE from 'three'

export function useLights(scene: THREE.Scene) {
  const light = new THREE.DirectionalLight(0xffffff, 3)
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
  light.shadow.radius = 4
  scene.add(light)
}
