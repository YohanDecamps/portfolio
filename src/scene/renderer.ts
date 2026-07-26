import * as THREE from 'three'

export function useRenderer(camera: THREE.Camera): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  
  document.body.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'
  
  if (camera instanceof THREE.OrthographicCamera) {
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
  }

  return renderer
}

