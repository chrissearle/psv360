<script setup lang="ts">
import type { Scene, Section } from "~~/shared/types"

const route = useRoute()
const id = route.params.id as string

const [{ data: sections, error }, { data: scenes }] = await Promise.all([
  useFetch<Section[]>("/api/sections"),
  useFetch<Scene[]>("/api/scenes"),
])

const section = computed(() => sections.value?.find((s) => s.id === id))

if (error.value || (sections.value && !section.value)) {
  throw createError({ statusCode: 404, message: `Section not found: ${id}` })
}

const sorted = computed<Scene[]>(() => {
  if (!scenes.value) return []
  return sortByDateDesc(scenes.value.filter((s) => s.sectionId === id))
})

const requestURL = useRequestURL()

const pageTitle = computed(() =>
  section.value ? `${section.value.name} — 360°` : "360°",
)
const pageDescription = computed(
  () =>
    section.value?.description ??
    "Browse a collection of self-hosted 360° panoramas.",
)

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogUrl: requestURL.href,
  ogType: "website",
  twitterCard: "summary",
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <UAlert
      v-if="error"
      color="error"
      title="Could not load section"
      :description="error.message"
      class="mb-8"
    />

    <template v-else-if="section">
      <h1 class="text-3xl font-bold mb-2">{{ section.name }}</h1>
      <p v-if="section.description" class="text-neutral-400 mb-8">
        {{ section.description }}
      </p>
      <div v-else class="mb-8"></div>

      <p v-if="sorted.length === 0" class="text-neutral-400">
        No panoramas found in this section.
      </p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SceneCard v-for="scene in sorted" :key="scene.id" :scene="scene" />
      </div>
    </template>
  </div>
</template>
