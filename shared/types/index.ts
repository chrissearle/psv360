export interface Hotspot {
  id: string
  targetId: string
  yaw: number
  pitch: number
  label?: string
}

export interface Scene {
  id: string
  name: string
  path: string
  date?: string
  hotspots: Hotspot[]
  defaultPosition?: { yaw: number; pitch: number }
}

export interface PanoConfig {
  scenes: Scene[]
}
