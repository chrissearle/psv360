#!/usr/bin/env node --experimental-strip-types
/**
 * Scans PANO_DIR for panorama directories (any directory containing a .jpg),
 * then creates or updates config.json with skeleton entries for any new scenes.
 *
 * Panos must live under a YYYY/MM/DD/<name>/ path so the script can extract
 * the date. Existing scene fields (name, hotspots, etc.) are never overwritten;
 * a missing `date` field is the only value backfilled on existing scenes.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import type { PanoConfig, Scene } from '../shared/types/index.ts'

const PANO_DIR = process.env.PANO_DIR ?? './data'
const CONFIG_PATH = join(PANO_DIR, 'config.json')

function findPanoDirs(dir: string, results: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  if (entries.some((e) => e.isFile() && /\.(jpg|jpeg)$/i.test(e.name))) results.push(dir)
  for (const entry of entries) {
    if (entry.isDirectory()) findPanoDirs(join(dir, entry.name), results)
  }
  return results
}

function makeId(panoDir: string): string {
  return relative(PANO_DIR, panoDir).split(sep).join('-')
}

function makeName(panoDir: string): string {
  return panoDir.split(sep).at(-1) ?? makeId(panoDir)
}

function findJpg(dir: string): string | undefined {
  return readdirSync(dir).find((f) => /\.(jpg|jpeg)$/i.test(f))
}

function extractDate(panoDir: string): string | undefined {
  const parts = relative(PANO_DIR, panoDir).split(sep)
  if (parts.length >= 3 && /^\d{4}$/.test(parts[0]) && /^\d{2}$/.test(parts[1]) && /^\d{2}$/.test(parts[2])) {
    return `${parts[0]}-${parts[1]}-${parts[2]}`
  }
  return undefined
}

function loadConfig(): PanoConfig {
  if (existsSync(CONFIG_PATH)) {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as PanoConfig
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
    continue
  }

  const jpg = findJpg(dir)
  if (!jpg) {
    console.warn(`Skipping ${dir}: no .jpg found`)
    continue
  }

  const imagePath = relative(PANO_DIR, join(dir, jpg)).split(sep).join('/')
  const scene: Scene = { id, name: makeName(dir), image: imagePath, ...(date && { date }), hotspots: [] }

  config.scenes.push(scene)
  console.log(`Added: ${id}  (${imagePath}${date ? `, ${date}` : ''})`)
  added++
}

writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n')

const changes = [added && `+${added} added`, updated && `+${updated} date backfilled`].filter(Boolean).join(', ')
console.log(changes ? `\nWrote ${CONFIG_PATH} (${changes})` : 'No changes.')
