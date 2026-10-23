import * as THREE from 'three'

export function useRenderer(): THREE.WebGLRenderer {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true })
  } catch (error) {
    console.warn('WebGL with antialias failed; retrying without antialias.', error)
    renderer = new THREE.WebGLRenderer({ antialias: false })
  }
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap

  document.body.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  return renderer
}
