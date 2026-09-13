import * as THREE from 'three'

export const VIEW_HEIGHT = 14.4

export function viewHalfExtents(viewHeight: number = VIEW_HEIGHT): { halfWidth: number; halfHeight: number } {
  const halfHeight = viewHeight / 2
  return {
    halfWidth: halfHeight * (window.innerWidth / window.innerHeight),
    halfHeight,
  }
}

export interface GroundFootprint {
  centerX: number
  centerZ: number

  forwardX: number
  forwardZ: number

  halfAcross: number
  halfDepth: number
}

const _dir = new THREE.Vector3()
const _pos = new THREE.Vector3()

export function groundFootprint(
  camera: THREE.Camera,
  viewHeight: number = VIEW_HEIGHT,
  groundY: number = 0
): GroundFootprint | null {
  camera.getWorldDirection(_dir) // also refreshes the camera's world matrix
  _pos.setFromMatrixPosition(camera.matrixWorld)

  const tilt = Math.abs(_dir.y) // sin(elevation): ground foreshortening
  const horizontal = Math.hypot(_dir.x, _dir.z)
  if (tilt < 1e-4 || horizontal < 1e-4) return null

  const { halfWidth, halfHeight } = viewHalfExtents(viewHeight)
  const t = (groundY - _pos.y) / _dir.y

  return {
    centerX: _pos.x + _dir.x * t,
    centerZ: _pos.z + _dir.z * t,
    forwardX: _dir.x / horizontal,
    forwardZ: _dir.z / horizontal,
    halfAcross: halfWidth,
    halfDepth: halfHeight / tilt,
  }
}
