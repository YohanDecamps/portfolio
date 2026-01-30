import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as THREE from 'three'

export function loadGLB(url: string): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(url, gltf => resolve(gltf.scene), undefined, reject)
  })
}

