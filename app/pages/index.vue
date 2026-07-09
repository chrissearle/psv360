<script setup lang="ts">
import type { Scene, Section } from "~~/shared/types"

const [{ data: scenes, error }, { data: sections }] = await Promise.all([
  useFetch<Scene[]>("/api/scenes"),
  useFetch<Section[]>("/api/sections"),
])

interface SectionCardData {
  section: Section
  thumbScene: Scene
  date: string | undefined
}

const sectionCards = computed<SectionCardData[]>(() => {
  if (!scenes.value || !sections.value) return []

  const cards = sections.value.flatMap((section) => {
    const members = scenes.value!.filter((s) => s.sectionId === section.id)
    const thumbScene = scenes.value!.find((s) => s.id === section.thumbId)
    if (!thumbScene) return []

    const date = sortByDateDesc(members)[0]?.date
    return [{ section, thumbScene, date }]
  })

  return sortByDateDesc(cards)
})

const ungrouped = computed<Scene[]>(() => {
  if (!scenes.value || !sections.value) return []
  const sectionIds = new Set(sections.value.map((s) => s.id))
  return sortByDateDesc(
    scenes.value.filter((s) => !s.sectionId || !sectionIds.has(s.sectionId)),
  )
})

const requestURL = useRequestURL()

useSeoMeta({
  title: "360° Panoramas",
  description: "Browse a collection of self-hosted 360° panoramas.",
  ogTitle: "360° Panoramas",
  ogDescription: "Browse a collection of self-hosted 360° panoramas.",
  ogUrl: requestURL.href,
  ogType: "website",
  twitterCard: "summary",
  twitterTitle: "360° Panoramas",
  twitterDescription: "Browse a collection of self-hosted 360° panoramas.",
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <UAlert
      v-if="error"
      color="error"
      title="Could not load panoramas"
      :description="error.message"
      class="mb-8"
    />

    <template v-else-if="scenes">
      <h1 class="text-3xl font-bold mb-8">Panoramas</h1>

      <p
        v-if="sectionCards.length === 0 && ungrouped.length === 0"
        class="text-neutral-400"
      >
        No panoramas found. Add images and a config.json to your pano directory.
      </p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SectionCard
          v-for="card in sectionCards"
          :key="card.section.id"
          :section="card.section"
          :thumb-scene="card.thumbScene"
        />
        <SceneCard v-for="scene in ungrouped" :key="scene.id" :scene="scene" />
      </div>
    </template>
  </div>
</template>
