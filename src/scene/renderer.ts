import * as THREE from 'three/webgpu'
import { pass } from 'three/tsl'
import { dof } from 'three/addons/tsl/display/DepthOfFieldNode.js'
import type DepthOfFieldNode from 'three/addons/tsl/display/DepthOfFieldNode.js'

export interface DepthOfFieldOptions {
  /** Distance along the camera's look direction that stays sharp, in world units. */
  focusDistance?: number
  /** How far from the focal plane an object can be before it is fully out of focus. */
  focalLength?: number
  /** Artistic bokeh size. */
  bokehScale?: number
}

export interface ViewRenderer {
  renderer: THREE.WebGPURenderer
  postProcessing: THREE.PostProcessing
  dof: DepthOfFieldNode
  setSize(width: number, height: number): void
}

/**
 * WebGPU renderer with a post-processing pipeline: the scene is rendered into a
 * target (colour + depth), the depth-of-field node blurs it, and the result is
 * output to the canvas. Falls back to the WebGL2 backend automatically when
 * WebGPU is unavailable.
 */
export async function useRenderer(
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: DepthOfFieldOptions = {}
): Promise<ViewRenderer> {
  const renderer = new THREE.WebGPURenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  // antialias:true sets 4 MSAA samples, which PassNode picks up for the scene
  // pass (post-processing bypasses the canvas framebuffer, so MSAA must live
  // on the pass's render target).
  await renderer.init()

  // Post-processing makes several internal render passes per frame; with
  // auto-reset each pass would clobber the stats, so accumulate and reset once
  // per frame (App.render does the reset).
  renderer.info.autoReset = false

  document.body.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'

  const scenePass = pass(scene, camera)
  const dofNode = dof(
    scenePass.getTextureNode(),
    scenePass.getViewZNode(),
    options.focusDistance ?? 35,
    options.focalLength ?? 20,
    options.bokehScale ?? 2
  )

  const postProcessing = new THREE.PostProcessing(renderer)
  postProcessing.outputNode = dofNode
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  return {
    renderer,
    postProcessing,
    dof: dofNode,
    setSize: (width: number, height: number) => renderer.setSize(width, height),
  }
}