import { loadPanoConfig } from "../../utils/panoConfig"

export default defineEventHandler(async () => {
  const config = await loadPanoConfig()
  return config.sections ?? []
})
