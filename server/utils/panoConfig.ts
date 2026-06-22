import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import type { PanoConfig } from '../../shared/types'

let cached: PanoConfig | null = null
let cachedMtime = 0

export async function loadPanoConfig(): Promise<PanoConfig> {
  const config = useRuntimeConfig()
  const configPath = join(config.panoDir, 'config.json')

  const fileStat = await stat(configPath).catch(() => {
    throw createError({
      statusCode: 500,
      message: `Could not read pano config from ${configPath}. Set PANO_DIR and ensure config.json exists.`,
    })
  })

  if (cached && fileStat.mtimeMs === cachedMtime) return cached

  const raw = await readFile(configPath, 'utf-8').catch(() => {
    throw createError({
      statusCode: 500,
      message: `Could not read pano config from ${configPath}. Set PANO_DIR and ensure config.json exists.`,
    })
  })

  cached = JSON.parse(raw) as PanoConfig
  cachedMtime = fileStat.mtimeMs
  return cached
}
