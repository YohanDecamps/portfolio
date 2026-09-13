import * as THREE from 'three'
import type { GameObject } from '../components/GameObject'
import { Mesh } from '../components/Mesh'
import { assetPool } from '../main'

type Series = { total: number; count: number; min: number; max: number; ema: number }

/**
 * Lightweight frame profiler shown as a DOM overlay (toggle with F).
 * Tracks per-category ms (physics / per-GameObject updates / render), rolling
 * frame-time stats, and a static per-GameObject mesh vertex count as a proxy
 * for render cost (vertex processing is the driver inside renderer.render()).
 * Click the overlay to reset all samples — use it to bracket a test run.
 */
export class Profiler {
  private series = new Map<string, Series>()
  private frameTimes: number[] = []
  private vertexCache = new Map<string, { verts: number; shadow: boolean }>()
  private overlay: HTMLDivElement | null = null
  private frames = 0

  record(name: string, ms: number): void {
    let s = this.series.get(name)
    if (!s) {
      s = { total: 0, count: 0, min: ms, max: ms, ema: ms }
      this.series.set(name, s)
    }
    s.total += ms
    s.count++
    if (ms < s.min) s.min = ms
    if (ms > s.max) s.max = ms
    s.ema += (ms - s.ema) * 0.05
  }

  recordFrame(ms: number): void {
    this.frames++
    this.frameTimes.push(ms)
    if (this.frameTimes.length > 240) this.frameTimes.shift()
  }

  /** Counts render-load proxy for one GameObject: mesh vertices + shadow flag. */
  meshStats(go: GameObject): { verts: number; shadow: boolean } {
    const cached = this.vertexCache.get(go.id)
    if (cached) return cached

    let verts = 0
    let shadow = false
    const mesh = go.getComponent(Mesh)
    if (mesh) {
      const model = mesh.meshName ? assetPool.getModel(mesh.meshName) : null
      if (model) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            verts += child.geometry?.attributes?.position?.count ?? 0
            shadow = shadow || child.castShadow
          }
        })
      }
    }
    const stats = { verts, shadow }
    this.vertexCache.set(go.id, stats)
    return stats
  }

  reset(): void {
    this.series.clear()
    this.frameTimes = []
  }

  show(): void {
    if (this.overlay) return
    this.overlay = document.createElement('div')
    this.overlay.style.cssText =
      'position:fixed;top:0;right:0;z-index:99;background:rgba(0,0,0,.7);' +
      'color:#8f8;font:11px monospace;padding:6px 8px;white-space:pre;cursor:pointer;' +
      'border:1px solid #3a3;opacity:.92'
    this.overlay.onclick = () => {
      this.reset()
      this.redraw()
    }
    document.body.appendChild(this.overlay)
    this.redraw()
  }

  hide(): void {
    this.overlay?.remove()
    this.overlay = null
  }

  private fmt(ms: number): string {
    return ms >= 100 ? ms.toFixed(0) : ms >= 10 ? ms.toFixed(1) : ms.toFixed(2)
  }

  private redraw(): void {
    if (!this.overlay) return
    const avg = (name: string) => {
      const s = this.series.get(name)
      return s ? { avg: s.total / s.count, ...s } : null
    }
    const frameAvg = this.frameTimes.reduce((a, b) => a + b, 0) / Math.max(1, this.frameTimes.length)
    const frameMin = this.frameTimes.length ? Math.min(...this.frameTimes) : 0
    const frameMax = this.frameTimes.length ? Math.max(...this.frameTimes) : 0

    const row = (name: string) => {
      const s = avg(name)
      return s ? `${name.padEnd(14)} ${this.fmt(s.avg).padStart(7)}ms  (max ${this.fmt(s.max)})` : ''
    }

    // Rolling totals across all GameObjects for the update-phase line
    let goTotal = 0
    const goRows: { id: string; avg: number }[] = []
    for (const [name, s] of this.series) {
      if (name.startsWith('GO ')) {
        const avgMs = s.total / s.count
        goTotal += avgMs
        goRows.push({ id: name.slice(3), avg: avgMs })
      }
    }
    goRows.sort((a, b) => b.avg - a.avg)

    const lines: string[] = []
    lines.push(`frame  avg ${this.fmt(frameAvg)}ms  ~${(1000 / Math.max(frameAvg, 0.001)).toFixed(0)}fps  min ${this.fmt(frameMin)} / max ${this.fmt(frameMax)}  (${this.frames} frames, click to reset)`)
    lines.push(`  ${row('physics')}`)
    lines.push(`  gameObjects   ${this.fmt(goTotal)}ms total`)
    lines.push(`  ${row('render')}`)
    lines.push('')
    lines.push('slowest updates (avg/frame):')
    for (const r of goRows.slice(0, 4)) {
      lines.push(`  ${r.id.padEnd(16)} ${this.fmt(r.avg).padStart(7)}ms`)
    }
    lines.push('')
    lines.push('heaviest meshes (vertex count ≈ render cost, shadow = 2 pass):')
    const byVerts = Array.from(this.vertexCache.entries())
      .sort((a, b) => b[1].verts - a[1].verts)
      .slice(0, 5)
    for (const [goId, v] of byVerts) {
      lines.push(`  ${goId.padEnd(14)} ${String(v.verts).padStart(8)}${v.shadow ? '  [shadow]' : ''}`)
    }

    this.overlay.textContent = lines.join('\n')
  }

  /** Call ~every 30 frames to refresh the overlay without hogging the loop. */
  update(): void {
    if (this.overlay && this.frames % 30 === 0) this.redraw()
  }
}