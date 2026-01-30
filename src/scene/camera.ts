import * as THREE from 'three'

export function useCamera(): THREE.Camera {
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
  return camera
}

