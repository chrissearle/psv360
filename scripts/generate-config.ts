#!/usr/bin/env node --experimental-strip-types
/* eslint-disable no-console */
/**
 * Scans PANO_DIR for panorama directories, creates or updates config.json with
 * skeleton entries for new scenes, backfills missing fields on existing scenes,
 * and generates tile sets (base.jpg + tiles/tile_COL_ROW.jpg) for any scene
 * that doesn't have them yet.
 *
 * Panos must live under a YYYY/MM/DD/<name>/ path for date extraction.
 * Each directory must contain panorama.jpg and thumb.jpg.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { join, relative, sep } from "node:path"
import { execSync } from "node:child_process"
import type { PanoConfig, Scene, TileConfig } from "../shared/types/index.ts"

const PANO_DIR = process.env.PANO_DIR ?? "./data"
const CONFIG_PATH = join(PANO_DIR, "config.json")
// PSV requires cols and rows to be powers of 2.
// 32×16 = 512 tiles per scene; tile size is derived per image from actual dimensions.
const COLS = 32
const ROWS = 16
const BASE_WIDTH = 1920

function findPanoDirs(dir: string, results: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  if (entries.some((e) => e.isFile() && e.name === "panorama.jpg"))
    results.push(dir)
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== "tiles")
      findPanoDirs(join(dir, entry.name), results)
  }
  return results
}

function makeId(panoDir: string): string {
  return relative(PANO_DIR, panoDir).split(sep).join("-")
}

function makeName(panoDir: string): string {
  return panoDir.split(sep).at(-1) ?? makeId(panoDir)
}

function extractDate(panoDir: string): string | undefined {
  const parts = relative(PANO_DIR, panoDir).split(sep)
  if (
    parts.length >= 3 &&
    /^\d{4}$/.test(parts[0]) &&
    /^\d{2}$/.test(parts[1]) &&
    /^\d{2}$/.test(parts[2])
  ) {
    return `${parts[0]}-${parts[1]}-${parts[2]}`
  }
  return undefined
}

function getImageDimensions(imagePath: string): { width: number; height: number } {
  const out = execSync(`magick identify -format "%wx%h" "${imagePath}"`).toString().trim()
  const [w, h] = out.split("x").map(Number)
  if (!w || !h) throw new Error(`Could not read dimensions from ${imagePath}`)
  return { width: w, height: h }
}

function generateTiles(dir: string): TileConfig {
  const panorama = join(dir, "panorama.jpg")
  const tilesDir = join(dir, "tiles")
  const base = join(dir, "base.jpg")

  const { width, height } = getImageDimensions(panorama)
  const tileW = Math.ceil(width / COLS)
  const tileH = Math.ceil(height / ROWS)

  console.log(`  Dimensions: ${width}x${height} → ${COLS}×${ROWS} tiles (${tileW}×${tileH}px each)`)

  mkdirSync(tilesDir, { recursive: true })

  console.log(`  Generating base.jpg...`)
  execSync(
    `magick "${panorama}" -resize ${BASE_WIDTH}x -quality 70 "${base}"`,
  )

  console.log(`  Generating ${COLS * ROWS} tiles...`)
  execSync(
    `magick "${panorama}" -crop ${tileW}x${tileH} -quality 85 ` +
      `-set filename:tile "%[fx:page.x/${tileW}]_%[fx:page.y/${tileH}]" ` +
      `"${tilesDir}/tile_%[filename:tile].jpg"`,
  )

  return { width, height, cols: COLS, rows: ROWS }
}

function loadConfig(): PanoConfig {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8")) as PanoConfig
  }
  return { scenes: [] }
}

const config = loadConfig()
const existingById = new Map(config.scenes.map((s) => [s.id, s]))
let added = 0
let updated = 0

for (const dir of findPanoDirs(PANO_DIR)) {
  const id = makeId(dir)
  const date = extractDate(dir)

  if (existingById.has(id)) {
    const scene = existingById.get(id)!

    if (!scene.date && date) {
      scene.date = date
      console.log(`Backfilled date: ${id}  (${date})`)
      updated++
    }

    if (!scene.tiles) {
      console.log(`Generating tiles: ${id}`)
      scene.tiles = generateTiles(dir)
      console.log(`  Done.`)
      updated++
    }

    continue
  }

  console.log(`Adding: ${id}`)
  const tiles = generateTiles(dir)
  const scenePath = relative(PANO_DIR, dir).split(sep).join("/")
  const scene: Scene = {
    id,
    name: makeName(dir),
    path: scenePath,
    ...(date && { date }),
    tiles,
    hotspots: [],
  }

  config.scenes.push(scene)
  added++
}

writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n")

const changes = [
  added && `+${added} added`,
  updated && `${updated} updated`,
]
  .filter(Boolean)
  .join(", ")
console.log(changes ? `\nWrote ${CONFIG_PATH} (${changes})` : "No changes.")
