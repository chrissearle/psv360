<script setup lang="ts">
import type { Scene, Section } from "~~/shared/types"

defineProps<{ section: Section; thumbScene: Scene }>()
</script>

<template>
  <NuxtLink :to="`/section/${section.id}`">
    <UCard
      class="group hover:ring-1 hover:ring-primary transition-all cursor-pointer overflow-hidden"
    >
      <template #header>
        <div class="aspect-video bg-neutral-800 overflow-hidden -mx-4 -mt-4">
          <img
            :src="`/api/image/${encodeURI(thumbScene.path)}/thumb.jpg`"
            :alt="section.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </template>

      <div class="pt-2">
        <h2 class="font-medium text-neutral-900 dark:text-neutral-100">
          {{ section.name }}
        </h2>
        <p v-if="section.description" class="text-sm text-neutral-400 mt-0.5">
          {{ section.description }}
        </p>
      </div>
    </UCard>
  </NuxtLink>
</template>
