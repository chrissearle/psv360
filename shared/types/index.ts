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
  image: string
  date?: string
  thumbnail?: string
  hotspots: Hotspot[]
  defaultPosition?: { yaw: number; pitch: number }
}

export interface PanoConfig {
  scenes: Scene[]
}
