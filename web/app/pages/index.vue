<!--
  pages/index.vue: the student-facing home page (/). No login.

  A big search box front and center: kids type their name, see their points, and tap
  their name to open their ledger (/students/:code, a random code, not the id). Nothing
  is shown until PUBLIC_SEARCH_MIN_LETTERS letters are typed.

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
    <img
      src="/images/bcrc-logo.png"
      alt="Bellingham + Skagit Coding + Robotics Club"
      class="mx-auto mt-6 w-full max-w-md"
    >

    <div class="mt-6 mb-2 text-center">
      <h1 class="text-[34px] leading-tight font-bold">Check your points!</h1>
      <p class="mt-1 text-muted">Type your name, then tap it to see every point you've earned.</p>
    </div>

    <SearchBar v-model="searchText" placeholder="Type your name" large autofocus />

    <p v-if="tooShort" class="mt-2 text-center text-muted italic">
      Type at least {{ PUBLIC_SEARCH_MIN_LETTERS }} letters.
    </p>

    <!--
      One grid for the labels and every result: [first | last | points]. Each row is a
      subgrid, so the columns line up across rows, and the points column is as wide as
      the widest total.
    -->
    <div v-else class="mt-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-x-3">
      <div v-if="results.length" class="col-span-3 grid grid-cols-subgrid px-1.5 text-xs tracking-wide text-muted uppercase" aria-hidden="true">
        <span>First</span><span>Last</span>
      </div>
      <ul class="col-span-3 grid grid-cols-subgrid">
        <li v-for="s in results" :key="s.code" class="col-span-3 grid grid-cols-subgrid border-b border-line">
          <NuxtLink
            :to="`/students/${s.code}`"
            class="col-span-3 grid grid-cols-subgrid items-baseline px-1.5 py-3 text-ink! no-underline hover:bg-panel/50"
          >
            <span class="truncate text-xl underline decoration-link underline-offset-4">{{ s.first_name }}</span>
            <span class="truncate text-xl underline decoration-link underline-offset-4">{{ s.last_name }}</span>
            <span class="text-right text-2xl font-bold whitespace-nowrap text-club-teal tabular-nums">
              {{ s.points }} <small class="text-[15px] font-normal text-ink">{{ s.points === 1 ? 'point' : 'points' }}</small>
              <span class="ml-1 text-ink">›</span>
            </span>
          </NuxtLink>
        </li>
        <li v-if="!results.length" class="col-span-3 px-1.5 py-3.5 text-center text-muted italic">
          {{ waiting ? 'Searching…' : 'No one found. Check the spelling, or ask an instructor.' }}
        </li>
      </ul>
    </div>
  </div>
</template>
