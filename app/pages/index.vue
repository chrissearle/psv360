<script setup lang="ts">
import type { Scene } from "~~/shared/types"

const { data: scenes, error } = await useFetch<Scene[]>("/api/scenes")

const sorted = computed<Scene[]>(() => {
  if (!scenes.value) return []
  return [...scenes.value].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })
})

useHead({ title: "360° Panoramas" })
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

      <p v-if="sorted.length === 0" class="text-neutral-400">
        No panoramas found. Add images and a config.json to your pano directory.
      </p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SceneCard v-for="scene in sorted" :key="scene.id" :scene="scene" />
      </div>
    </template>
  </div>
</template>
