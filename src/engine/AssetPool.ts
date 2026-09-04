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
    const modelList: [string, string][] = [
      ['ground', 'models/ground.glb'],
      ['vehicle', 'models/vehicle.glb'],
      ['cube', 'models/cube.glb'],
      ['bowling-ball', 'models/bowling-ball.glb'],
      ['bowling-pin', 'models/bowling-pin.glb'],
      ['name-text-d', 'models/name-text/name-text-d.glb'],
      ['name-text-d-collider', 'models/name-text/name-text-d-collider.glb'],
      ['name-text-e', 'models/name-text/name-text-e.glb'],
      ['name-text-e-collider', 'models/name-text/name-text-e-collider.glb'],
      ['name-text-c', 'models/name-text/name-text-c.glb'],
      ['name-text-c-collider', 'models/name-text/name-text-c-collider.glb'],
      ['name-text-a', 'models/name-text/name-text-a.glb'],
      ['name-text-a-collider', 'models/name-text/name-text-a-collider.glb'],
      ['name-text-m', 'models/name-text/name-text-m.glb'],
      ['name-text-p', 'models/name-text/name-text-p.glb'],
      ['name-text-s', 'models/name-text/name-text-s.glb'],
      ['name-text-y', 'models/name-text/name-text-y.glb'],
      ['name-text-y-collider', 'models/name-text/name-text-y-collider.glb'],
      ['name-text-o', 'models/name-text/name-text-o.glb'],
      ['name-text-h', 'models/name-text/name-text-h.glb'],
      ['name-text-n', 'models/name-text/name-text-n.glb'],
      ['text-game', 'models/text/text-game.glb'],
      ['text-dev', 'models/text/text-dev.glb'],
      ['cpp', 'models/cpp.glb'],
      ['cs', 'models/cs.glb'],
      ['unity', 'models/unity.glb'],
      ['cpp-collider', 'models/cpp-collider.glb'],
      ['suzanne', 'models/suzanne.glb'],
      ['suzanne-collider', 'models/suzanne-collider.glb'],
      ['stargirl', 'models/stargirl.glb'],
      ['stargirl-collider', 'models/stargirl-collider.glb'],
      ['enter-zone', 'models/enter-zone.glb'],
      ['bowling-reset', 'models/bowling-reset.glb'],
      ['arrow', 'models/arrow.glb'],
      ['painting', 'models/painting.glb'],
      ['painting-feet-collider', 'models/painting-feet-collider.glb'],
      ['painting-canva-collider', 'models/painting-canva-collider.glb'],
      ['arcade', 'models/arcade.glb'],
      ['arcade-collider', 'models/arcade-collider.glb'],
      ['keyboard', 'models/keyboard.glb'],
      ['keyboard-collider', 'models/keyboard-collider.glb'],
      ['globe', 'models/globe.glb'],
      ['globe-stand-collider', 'models/globe-stand-collider.glb'],
    ]
  
    // fire off every load immediately (don't await here)
    const modelPromises = modelList.map(
      ([name, path]) => loadGLB(path).then(model => [name, model] as const)
    )
    const fontPromise = loadFont('fonts/AdwaitaMono-Regular.json').then(
      font => ['adwaita', font] as const
    )
  
    // now wait for all of them together
    const [models, [fontName, font]] = await Promise.all([
      Promise.all(modelPromises),
      fontPromise,
    ])
  
    for (const [name, model] of models) {
      this.addModel(name, model)
    }
    this.addFont(fontName, font)
  }
}
