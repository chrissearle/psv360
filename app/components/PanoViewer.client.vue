<script setup lang="ts">
import { Viewer, events } from "@photo-sphere-viewer/core"
import {
  VirtualTourPlugin,
  events as vtEvents,
} from "@photo-sphere-viewer/virtual-tour-plugin"
import "@photo-sphere-viewer/core/index.css"
import "@photo-sphere-viewer/virtual-tour-plugin/index.css"
import type { Scene } from "~~/shared/types"

const props = defineProps<{
  scene: Scene
  allScenes: Scene[]
}>()

const isDev = import.meta.dev

const panoTitle = useState<string | null>("pano-title", () => null)

const container = ref<HTMLDivElement>()
let viewer: Viewer | null = null

const currentPos = ref({ yaw: 0, pitch: 0 })
const clickedPos = ref<{ yaw: number; pitch: number } | null>(null)

const fmt = (n: number) => n.toFixed(4)

const defaultPositionJson = computed(
  () =>
    `"defaultPosition": {"yaw": ${fmt(currentPos.value.yaw)}, "pitch": ${fmt(currentPos.value.pitch)}}`,
)
const clickedJson = computed(() =>
  clickedPos.value
    ? `"yaw": ${fmt(clickedPos.value.yaw)}, "pitch": ${fmt(clickedPos.value.pitch)}`
    : "",
)

onMounted(() => {
  requestAnimationFrame(() => {
    if (!container.value) {
      console.error("[PanoViewer] container ref is null")
      return
    }

    const rect = container.value.getBoundingClientRect()
    container.value.style.height = `${window.innerHeight - rect.top}px`

    const defaultPositions = new Map(
      props.allScenes
        .filter((s) => s.defaultPosition)
        .map((s) => [s.id, s.defaultPosition!]),
    )

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
        navbar: ["zoom", "move", "fullscreen"],
        plugins: [
          [
            VirtualTourPlugin,
            { nodes, startNodeId: props.scene.id, renderMode: "3d" },
          ],
        ],
      })

      const virtualTour = viewer.getPlugin(VirtualTourPlugin)
      virtualTour.addEventListener(vtEvents.NodeChangedEvent.type, (e) => {
        const pos = defaultPositions.get(e.node.id)
        if (pos) viewer?.rotate(pos)

        if (e.data.fromNode) {
          history.pushState(null, "", `/pano/${e.node.id}`)
          const name = e.node.name ?? e.node.id
          panoTitle.value = name
          document.title = `${name} — 360°`
        }
      })

      if (import.meta.dev) {
        viewer.addEventListener(events.PositionUpdatedEvent.type, (e) => {
          currentPos.value = { yaw: e.position.yaw, pitch: e.position.pitch }
        })
        viewer.addEventListener(events.ClickEvent.type, (e) => {
          clickedPos.value = { yaw: e.data.yaw, pitch: e.data.pitch }
        })
      }
    } catch (e) {
      console.error("[PanoViewer] PSV init failed:", e)
    }
  })
})

onBeforeUnmount(() => {
  viewer?.destroy()
  viewer = null
})
</script>

<template>
  <div class="relative w-full">
    <div ref="container"></div>
    <div
      v-if="isDev"
      class="absolute top-4 right-4 z-50 bg-black/75 text-white text-xs font-mono rounded p-3 space-y-2 pointer-events-none select-text"
    >
      <div class="font-semibold text-neutral-300 mb-1">Coordinate Picker</div>
      <div>
        <div class="text-neutral-400">Current view (defaultPosition)</div>
        <div>
          yaw: {{ fmt(currentPos.yaw) }} &nbsp; pitch:
          {{ fmt(currentPos.pitch) }}
        </div>
        <div class="text-neutral-500 mt-0.5">{{ defaultPositionJson }}</div>
      </div>
      <div v-if="clickedPos">
        <div class="text-neutral-400">Last click (hotspot position)</div>
        <div>
          yaw: {{ fmt(clickedPos.yaw) }} &nbsp; pitch:
          {{ fmt(clickedPos.pitch) }}
        </div>
        <div class="text-neutral-500 mt-0.5">{{ clickedJson }}</div>
      </div>
      <div v-else class="text-neutral-500">
        Click the sphere to record a hotspot position
      </div>
    </div>
  </div>
</template>
