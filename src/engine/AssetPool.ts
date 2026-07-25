import * as THREE from 'three'
import { loadGLB } from '../lib/loadGLB'

export class AssetPool {
  private static models: Map<string, THREE.Object3D> = new Map()

  public addModel(name: string, model: THREE.Object3D): void {
    AssetPool.models.set(name, model)
  }

  public getModel(name: string): THREE.Object3D | undefined {
    return AssetPool.models.get(name)
  }

  public async loadAllAssets(): Promise<void> {
    this.addModel('ground', await loadGLB('models/ground.glb'))
    this.addModel('vehicle', await loadGLB('models/vehicle.glb'))
    this.addModel('cube', await loadGLB('models/cube.glb'))
  }
}
