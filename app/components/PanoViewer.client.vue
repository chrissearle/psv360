<script setup lang="ts">
import { Viewer } from '@photo-sphere-viewer/core'
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'
import type { Scene } from '~~/shared/types'

const props = defineProps<{
  scene: Scene
  allScenes: Scene[]
}>()

const container = ref<HTMLDivElement>()
let viewer: Viewer | null = null

onMounted(() => {
  requestAnimationFrame(() => {
    if (!container.value) {
      console.error('[PanoViewer] container ref is null')
      return
    }

    const rect = container.value.getBoundingClientRect()
    container.value.style.height = `${window.innerHeight - rect.top}px`

    console.log('[PanoViewer] rect.top:', rect.top, '| height set to:', window.innerHeight - rect.top)
    console.log('[PanoViewer] scene:', props.scene.id, '| nodes:', props.allScenes.length)

    const nodes = props.allScenes.map((s) => ({
      id: s.id,
      panorama: `/api/image/${encodeURI(s.image)}`,
      name: s.name,
      thumbnail: s.thumbnail
        ? `/api/image/${encodeURI(s.thumbnail)}`
        : undefined,
      links: s.hotspots.map((h) => ({
        nodeId: h.targetId,
        position: { yaw: h.yaw, pitch: h.pitch },
        name: h.label,
      })),
    }))

    try {
      viewer = new Viewer({
        container: container.value,
        navbar: ['zoom', 'move', 'fullscreen'],
        plugins: [
          [
            VirtualTourPlugin,
            {
              nodes,
              startNodeId: props.scene.id,
              renderMode: '3d',
            },
          ],
        ],
      })
    } catch (e) {
      console.error('[PanoViewer] PSV init failed:', e)
    }
  })
})

onBeforeUnmount(() => {
  viewer?.destroy()
  viewer = null
})
</script>

<template>
  <div ref="container" class="w-full" />
</template>
