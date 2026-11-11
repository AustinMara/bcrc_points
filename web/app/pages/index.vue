<!--
  pages/index.vue: the student-facing home page (/). No login.

  A big search box front and center: kids type their name, see their points, and tap
  their name to open their ledger (/students/:id). Results show first name + last
  initial only, and nothing is shown until PUBLIC_SEARCH_MIN_LETTERS letters are typed.

  The search text is kept in the address (/?q=ben), so the Back button from a ledger
  returns to the same results, and a kid can bookmark their own search.

  The watcher waits for typing to pause (useDebounced), saves the text to the address,
  asks the server, and ignores answers that arrive after the text has changed again.
-->
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const searchText = ref(String(route.query.q ?? ''))
const debouncedText = useDebounced(searchText)
const searching = ref(false)

const tooShort = computed(() => searchText.value.trim().length < PUBLIC_SEARCH_MIN_LETTERS)
const waiting = computed(() => searching.value || debouncedText.value !== searchText.value)

// Initial results (e.g. coming back from a ledger) are fetched during server rendering.
const { data: initialResults } = await useFetch<PublicStudent[]>('/api/public/points', { query: { q: searchText.value } })
const results = ref<PublicStudent[]>(initialResults.value ?? [])

watch(debouncedText, async (text) => {
  const q = text.trim()
  router.replace({ query: q ? { q } : {} })
  if (q.length < PUBLIC_SEARCH_MIN_LETTERS) {
    results.value = []
    return
  }
  searching.value = true
  try {
    const found = await $fetch<PublicStudent[]>('/api/public/points', { query: { q } })
    if (text === searchText.value) results.value = found
  } finally {
    searching.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-xl">
    <div class="mt-8 mb-2 text-center">
      <h1 class="text-[34px] leading-tight font-bold">Check your points!</h1>
      <p class="mt-1 text-gray-700">Type your name, then tap it to see every point you've earned.</p>
    </div>

    <SearchBar v-model="searchText" placeholder="Type your name" large />

    <p v-if="tooShort" class="mt-2 text-center text-gray-600 italic">
      Type at least {{ PUBLIC_SEARCH_MIN_LETTERS }} letters.
    </p>

    <ul v-else class="mt-2">
      <li v-for="s in results" :key="s.id" class="border-b border-silver">
        <NuxtLink
          :to="`/students/${s.id}`"
          class="flex items-baseline justify-between gap-3 px-1.5 py-3 text-black! no-underline hover:bg-silver/30"
        >
          <span class="text-xl underline decoration-link underline-offset-4">{{ publicName(s) }}</span>
          <span class="text-2xl font-bold whitespace-nowrap text-club-teal tabular-nums">
            {{ s.points }} <small class="text-[15px] font-normal text-black">{{ s.points === 1 ? 'point' : 'points' }}</small>
            <span class="ml-1 text-black">›</span>
          </span>
        </NuxtLink>
      </li>
      <li v-if="!results.length" class="px-1.5 py-3.5 text-center text-gray-600 italic">
        {{ waiting ? 'Searching…' : 'No one found. Check the spelling, or ask an instructor.' }}
      </li>
    </ul>
  </div>
</template>
