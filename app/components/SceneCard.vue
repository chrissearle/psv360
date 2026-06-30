<script setup lang="ts">
import type { Scene } from "~~/shared/types"

const props = defineProps<{ scene: Scene }>()

const formattedDate = computed(() => {
  if (!props.scene.date) return null
  const parts = props.scene.date.split("-").map(Number)
  const [y, m, d] = parts
  if (y === undefined || m === undefined || d === undefined) return null
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, d))
})
</script>

<template>
  <NuxtLink :to="`/pano/${scene.id}`">
    <UCard
      class="group hover:ring-1 hover:ring-primary transition-all cursor-pointer overflow-hidden"
    >
      <template #header>
        <div class="aspect-video bg-neutral-800 overflow-hidden -mx-4 -mt-4">
          <img
            :src="`/api/image/${encodeURI(scene.path)}/thumb.jpg`"
            :alt="scene.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </template>

      <div class="pt-2">
        <h2 class="font-medium text-neutral-900 dark:text-neutral-100">
          {{ scene.name }}
        </h2>
        <p v-if="formattedDate" class="text-sm text-neutral-400 mt-0.5">
          {{ formattedDate }}
        </p>
        <p class="text-sm text-neutral-500 mt-1">
          {{ scene.hotspots.length }}
          {{ scene.hotspots.length === 1 ? "link" : "links" }}
        </p>
      </div>
    </UCard>
  </NuxtLink>
</template>
