export interface Hotspot {
  id: string
  targetId: string
  yaw: number
  pitch: number
  label?: string
}

export interface TileConfig {
  width: number
  height: number
  cols: number
  rows: number
}

export interface Scene {
  id: string
  name: string
  path: string
  date?: string
  tiles?: TileConfig
  hotspots: Hotspot[]
  defaultPosition?: { yaw: number; pitch: number }
}

export interface PanoConfig {
  scenes: Scene[]
}
