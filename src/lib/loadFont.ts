
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

export function loadFont(url: string): Promise<Font> {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader()
    loader.load(url, font => resolve(font), undefined, reject)
  })
}

