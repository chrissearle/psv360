<script setup lang="ts">
import type { Scene } from "~~/shared/types"

const route = useRoute()
const id = route.params.id as string

const { data: scene, error } = await useFetch<Scene>(`/api/scenes/${id}`)

if (error.value) {
  throw createError({ statusCode: 404, message: `Scene not found: ${id}` })
}

const requestURL = useRequestURL()

const pageTitle = computed(() => scene.value?.name ?? "360° Panorama")
const pageImage = computed(() => {
  const s = scene.value
  return s
    ? `${requestURL.origin}/api/image/${encodeURI(s.path)}/thumb.jpg`
    : undefined
})

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  ogImage: pageImage,
  ogUrl: () => requestURL.href,
  twitterCard: "summary_large_image",
  twitterTitle: pageTitle,
  twitterImage: pageImage,
})

definePageMeta({ layout: false })
</script>

<template>
  <div
    class="relative w-full aspect-video bg-neutral-900 overflow-hidden group"
  >
    <template v-if="scene">
      <NuxtLink :to="`/pano/${scene.id}`" target="_blank" rel="noopener">
        <img
          :src="`/api/image/${encodeURI(scene.path)}/thumb.jpg`"
          :alt="scene.name"
          class="w-full h-full object-cover"
        />

        <div
          class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span
            class="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
          >
            <UIcon
              name="i-heroicons-arrow-top-right-on-square"
              class="w-4 h-4"
            />
            View in 360°
          </span>
        </div>

        <div
          class="absolute bottom-2 left-3 text-white text-sm font-medium drop-shadow"
        >
          {{ scene.name }}
        </div>
      </NuxtLink>
    </template>
  </div>
</template>
