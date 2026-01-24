// src/main.ts
import * as THREE from 'three'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)

camera.position.z = 3

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({ color: 0xff5555 })
const cube = new THREE.Mesh(geometry, material)

scene.add(cube)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(3, 3, 3)
scene.add(light)

function animate() {
  requestAnimationFrame(animate)
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
}

animate()
