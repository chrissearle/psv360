<script setup lang="ts">
import type { Scene } from '~~/shared/types'

const route = useRoute()
const id = route.params.id as string

const [{ data: scene, error }, { data: allScenes }] = await Promise.all([
  useFetch<Scene>(`/api/scenes/${id}`),
  useFetch<Scene[]>('/api/scenes'),
])

if (error.value) {
  throw createError({ statusCode: 404, message: `Scene not found: ${id}` })
}

useHead(() => ({ title: scene.value ? `${scene.value.name} — 360°` : '360°' }))

const panoTitle = useState<string | null>('pano-title', () => null)
panoTitle.value = scene.value?.name ?? null
</script>

<template>
  <div class="fixed inset-0 top-[57px]">
    <ClientOnly>
      <PanoViewer
        v-if="scene && allScenes"
        :scene="scene"
        :all-scenes="allScenes"
      />
      <template #fallback>
        <div class="flex items-center justify-center h-full text-neutral-400">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
