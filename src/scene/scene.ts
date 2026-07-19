import * as THREE from 'three'
import RAPIER from "@dimforge/rapier3d-compat"
import { loadGLB } from "../loadGLB";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { TTFLoader } from "three/examples/jsm/Addons.js";

export async function useScene(world: RAPIER.World, scene: THREE.Scene) {
  const sceneModel = await loadGLB('/models/scene.glb')
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  })
  scene.add(sceneModel) 

  const loader = new TTFLoader();
  const fontData = await loader.loadAsync( 'fonts/futura.ttf' );
  const font = new FontLoader().parse( fontData );
  const geometry = new TextGeometry( 'Scenelab', {
  	font: font,
  	size: 80,
  	depth: 5,
  	curveSegments: 12
  });
  const material = new THREE.MeshBasicMaterial( { color: 0x222222 } );
  const textMesh = new THREE.Mesh( geometry, material );
  textMesh.rotateX(-Math.PI / 2)
  textMesh.rotateZ(Math.PI / 2)
  textMesh.scale.set(0.005, 0.005, 0.005)
  textMesh.position.set(0, 0, 0)
  scene.add( textMesh );
}
