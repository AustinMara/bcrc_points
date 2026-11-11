<!--
  pages/index.vue: the student-facing home page (/). No login.

  Kids type their name and see their points. Results show first name + last initial
  only (see server/api/public/points.get.ts), and nothing is shown until at least
  PUBLIC_SEARCH_MIN_LETTERS letters are typed.

  The watcher waits for typing to pause (useDebounced), then asks the server, and
  ignores answers that arrive after the search text has changed again.
-->
<script setup lang="ts">
const searchText = ref('')
const debouncedText = useDebounced(searchText)
const results = ref<PublicStudent[]>([])
const searching = ref(false)

const tooShort = computed(() => searchText.value.trim().length < PUBLIC_SEARCH_MIN_LETTERS)
const waiting = computed(() => searching.value || debouncedText.value !== searchText.value)

watch(debouncedText, async (text) => {
  if (text.trim().length < PUBLIC_SEARCH_MIN_LETTERS) {
    results.value = []
    return
  }
  searching.value = true
  try {
    const found = await $fetch<PublicStudent[]>('/api/public/points', { query: { q: text.trim() } })
    if (text === searchText.value) results.value = found
  } finally {
    searching.value = false
  }
})
</script>

<template>
  <h1 class="mt-4 text-[26px] font-bold">Check your points!</h1>

  <SearchBar v-model="searchText" placeholder="Type your name" />

  <p v-if="tooShort" class="mx-1.5 my-2 text-gray-600 italic">
    Type at least {{ PUBLIC_SEARCH_MIN_LETTERS }} letters of your name.
  </p>

  <template v-else>
    <ListHeader><h2>Results</h2></ListHeader>
    <ul>
      <li v-for="(s, i) in results" :key="i" class="flex items-baseline justify-between gap-3 border-b border-silver px-1.5 py-3">
        <span class="text-xl">{{ publicName(s) }}</span>
        <span class="text-2xl font-bold whitespace-nowrap text-club-teal tabular-nums">
          {{ s.points }} <small class="text-[15px] font-normal text-black">{{ s.points === 1 ? 'point' : 'points' }}</small>
        </span>
      </li>
      <li v-if="!results.length" class="px-1.5 py-3.5 text-gray-600 italic">
        {{ waiting ? 'Searching…' : 'No one found. Check the spelling, or ask an instructor.' }}
      </li>
    </ul>
  </template>
</template>
