<script setup lang="ts">
const route = useRoute()
const isSubPage = computed(() => route.path !== "/")

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === "dark")
const toggleColorMode = () => {
  colorMode.preference = isDark.value ? "light" : "dark"
}

const panoTitle = useState<string | null>("pano-title", () => null)
const panoSectionId = useState<string | null>("pano-section-id", () => null)
const showPanoTitle = computed(
  () => route.path.startsWith("/pano/") && !!panoTitle.value,
)
const backTo = computed(() =>
  route.path.startsWith("/pano/") && panoSectionId.value
    ? `/section/${panoSectionId.value}`
    : "/",
)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header
      class="border-b border-neutral-800 px-6 py-4 grid grid-cols-3 items-center"
    >
      <div class="flex items-center gap-3">
        <NuxtLink
          v-if="isSubPage"
          :to="backTo"
          aria-label="Back to list"
          class="text-neutral-400 hover:text-neutral-100 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <NuxtLink
          to="/"
          class="text-xl font-semibold tracking-tight hover:text-primary transition-colors"
        >
          360° Panoramas
        </NuxtLink>
      </div>

      <ClientOnly>
        <div
          class="text-center text-xl font-semibold tracking-tight truncate px-2"
        >
          {{ showPanoTitle ? panoTitle : "" }}
        </div>
        <template #fallback>
          <div></div>
        </template>
      </ClientOnly>

      <div class="flex justify-end">
        <UButton
          variant="ghost"
          size="sm"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleColorMode"
        >
          <ClientOnly>
            <UIcon
              :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              class="w-4 h-4"
            />
            <template #fallback>
              <UIcon name="i-heroicons-moon" class="w-4 h-4" />
            </template>
          </ClientOnly>
        </UButton>
      </div>
    </header>
    <main class="flex-1">
      <slot></slot>
    </main>
  </div>
</template>
