
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

export function loadFont(url: string): Promise<Font> {
  return new Promise((resolve, reject) => {
    const loader = new FontLoader()
    loader.load(url, font => resolve(font), undefined, reject)
  })
}

export async function loadBrowserFont(family: string, url: string): Promise<void> {
  const face = new FontFace(family, `url(${url})`)
  await face.load()
  document.fonts.add(face)
}

