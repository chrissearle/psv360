import { createReadStream, existsSync } from "node:fs"
import { extname, resolve } from "node:path"

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
}

export default defineEventHandler(async (event) => {
  const raw = getRouterParam(event, "path") ?? ""
  const imagePath = decodeURIComponent(raw)

  if (!imagePath || imagePath.includes("\x00")) {
    throw createError({ statusCode: 400, message: "Invalid path" })
  }

  const root = resolve(process.env.PANO_DIR ?? useRuntimeConfig().panoDir)
  const filepath = resolve(root, imagePath)

  // Prevent path traversal — resolved path must stay inside PANO_DIR
  if (!filepath.startsWith(root + "/") && filepath !== root) {
    throw createError({ statusCode: 400, message: "Invalid path" })
  }

  if (!existsSync(filepath)) {
    throw createError({ statusCode: 404, message: "Image not found" })
  }

  const ext = extname(filepath).toLowerCase()

  setHeader(event, "Content-Type", MIME[ext] ?? "application/octet-stream")
  setHeader(event, "Cache-Control", "public, max-age=3600")

  return sendStream(event, createReadStream(filepath))
})
