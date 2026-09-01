import * as THREE from 'three'
import { loadGLB } from '../lib/loadGLB'
import type { GameObject } from '../components/GameObject'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import type { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { loadFont } from '../lib/loadFont';

export class AssetPool {
  private static models: Map<string, THREE.Object3D> = new Map()
  private static prefabs: Map<string, GameObject> = new Map()
  private static fonts: Map<string, THREE.Font> = new Map()

  public addModel(name: string, model: THREE.Object3D): void {
    AssetPool.models.set(name, model)
  }

  public getModel(name: string): THREE.Object3D | undefined {
    return AssetPool.models.get(name)
  }

  public addPrefab(name: string, prefab: GameObject): void {
    AssetPool.prefabs.set(name, prefab)
  };

  public getPrefab(name: string): GameObject | undefined {
    return AssetPool.prefabs.get(name)
  }

  public addFont(name: string, font: Font): void {
    AssetPool.fonts.set(name, font)
  }

  public getFont(name: string): Font | undefined {
    return AssetPool.fonts.get(name)
  }

  public async loadAllAssets(): Promise<void> {
    this.addModel('ground', await loadGLB('models/ground.glb'))
    this.addModel('vehicle', await loadGLB('models/vehicle.glb'))
    this.addModel('cube', await loadGLB('models/cube.glb'))
    this.addModel('bowling-ball', await loadGLB('models/bowling-ball.glb'))
    this.addModel('bowling-pin', await loadGLB('models/bowling-pin.glb'))
    this.addModel('name-text-d', await loadGLB('models/name-text/name-text-d.glb'))
    this.addModel('name-text-d-collider', await loadGLB('models/name-text/name-text-d-collider.glb'))
    this.addModel('name-text-e', await loadGLB('models/name-text/name-text-e.glb'))
    this.addModel('name-text-e-collider', await loadGLB('models/name-text/name-text-e-collider.glb'))
    this.addModel('name-text-c', await loadGLB('models/name-text/name-text-c.glb'))
    this.addModel('name-text-c-collider', await loadGLB('models/name-text/name-text-c-collider.glb'))
    this.addModel('name-text-a', await loadGLB('models/name-text/name-text-a.glb'))
    this.addModel('name-text-a-collider', await loadGLB('models/name-text/name-text-a-collider.glb'))
    this.addModel('name-text-m', await loadGLB('models/name-text/name-text-m.glb'))
    this.addModel('name-text-p', await loadGLB('models/name-text/name-text-p.glb'))
    this.addModel('name-text-s', await loadGLB('models/name-text/name-text-s.glb'))
    this.addModel('name-text-y', await loadGLB('models/name-text/name-text-y.glb'))
    this.addModel('name-text-y-collider', await loadGLB('models/name-text/name-text-y-collider.glb'))
    this.addModel('name-text-o', await loadGLB('models/name-text/name-text-o.glb'))
    this.addModel('name-text-h', await loadGLB('models/name-text/name-text-h.glb'))
    this.addModel('name-text-n', await loadGLB('models/name-text/name-text-n.glb'))
    this.addModel('text-game', await loadGLB('models/text/text-game.glb'))
    this.addModel('text-dev', await loadGLB('models/text/text-dev.glb'))
    this.addModel('cpp', await loadGLB('models/cpp.glb'))
    this.addModel('cs', await loadGLB('models/cs.glb'))
    this.addModel('unity', await loadGLB('models/unity.glb'))
    this.addModel('cpp-collider', await loadGLB('models/cpp-collider.glb'))
    this.addModel('suzanne', await loadGLB('models/suzanne.glb'))
    this.addModel('suzanne-collider', await loadGLB('models/suzanne-collider.glb'))
    this.addModel('stargirl', await loadGLB('models/stargirl.glb'))
    this.addModel('stargirl-collider', await loadGLB('models/stargirl-collider.glb'))
    this.addModel('enter-zone', await loadGLB('models/enter-zone.glb'))
    this.addModel('bowling-reset', await loadGLB('models/bowling-reset.glb'))
    this.addModel('arrow', await loadGLB('models/arrow.glb'))
    this.addModel('painting', await loadGLB('models/painting.glb'))
    this.addModel('painting-feet-collider', await loadGLB('models/painting-feet-collider.glb'))
    this.addModel('painting-canva-collider', await loadGLB('models/painting-canva-collider.glb'))
    this.addModel('arcade', await loadGLB('models/arcade.glb'))
    this.addModel('arcade-collider', await loadGLB('models/arcade-collider.glb'))
    this.addModel('keyboard', await loadGLB('models/keyboard.glb'))
    this.addModel('keyboard-collider', await loadGLB('models/keyboard-collider.glb'))
    this.addFont('adwaita', await loadFont('fonts/AdwaitaMono-Regular.json'))
  }
}
