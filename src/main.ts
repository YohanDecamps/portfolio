import * as THREE from 'three'
import './style.css'

const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera(
  window.innerWidth / -200,
  window.innerWidth / 200,
  window.innerHeight / 200,
  window.innerHeight / -200,
  0.1,
  1000
)

camera.position.z = 3
camera.position.y = 3
camera.position.x = 3

camera.lookAt(0, 0, 0)


const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

document.body.appendChild(renderer.domElement)
renderer.domElement.style.display = 'block'

window.addEventListener('resize', () => {
  const width = window.innerWidth
  const height = window.innerHeight

  camera.left = width / -200
  camera.right = width / 200
  camera.top = height / 200
  camera.bottom = height / -200
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

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
