import { loadPanoConfig } from "../../utils/panoConfig"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  const config = await loadPanoConfig()
  const scene = config.scenes.find((s) => s.id === id)

  if (!scene) {
    throw createError({ statusCode: 404, message: `Scene not found: ${id}` })
  }

  return scene
})
