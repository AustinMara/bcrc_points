<!--
  pages/instructor/index.vue: the instructor home page (/instructor). Login required.

  Shows the instructor's starred students, or search results while typing. Tap rows to
  select students (the selection survives new searches), then give everyone selected
  points at once from the bar pinned to the bottom of the screen.

  toggleSelected(id)          select or unselect one student
  toggleAllVisible()          select or unselect everyone currently listed
  giveToSelected(points, why) save points for everyone selected (called by PointsForm)
  toggleAddForm()             open/close the add-student form, pre-filled from the search
                              text ("Jane Doe" becomes first "Jane", last "Doe")
  submitNewStudent()          add the student; they appear starred in My Students
-->
<script setup lang="ts">
const {
  favorites, isFavorite, lookup, loadFavorites,
  searchCache, cacheHasAllMatches, fetchMatches,
  awardPoints, addStudent, toggleFavorite,
} = useRoster()
await loadFavorites()

// --- Search: cached matches show on every keystroke; the server is asked once typing pauses ---
const searchText = ref('')
const isSearching = computed(() => searchText.value.trim() !== '')
const checkingServer = ref(false)

watch(useDebounced(searchText), async (text) => {
  if (!text.trim() || cacheHasAllMatches(text)) return
  checkingServer.value = true
  try {
    await fetchMatches(text)
  } finally {
    checkingServer.value = false
  }
})

// Computed from the cache, so new server results and point changes appear automatically.
const visibleStudents = computed(() => (isSearching.value ? searchCache(searchText.value) : favorites.value))

// --- Selection ---
const selectedIds = ref(new Set<number>())
const selectedStudents = computed(() => lookup([...selectedIds.value]))

function toggleSelected(id: number) {
  if (selectedIds.value.has(id)) selectedIds.value.delete(id)
  else selectedIds.value.add(id)
}

const allVisibleSelected = computed(
  () => visibleStudents.value.length > 0 && visibleStudents.value.every((s) => selectedIds.value.has(s.id)),
)
function toggleAllVisible() {
  const select = !allVisibleSelected.value
  for (const s of visibleStudents.value) {
    if (select) selectedIds.value.add(s.id)
    else selectedIds.value.delete(s.id)
  }
}

// --- Giving points ---
const status = ref('')

async function giveToSelected(points: number, reason: string) {
  const count = selectedIds.value.size
  await awardPoints([...selectedIds.value], points, reason)
  status.value = `${signed(points)} points to ${count} student${count === 1 ? '' : 's'}`
  selectedIds.value.clear()
}

// --- Adding a student ---
const showAddForm = ref(false)
const firstName = ref('')
const lastName = ref('')
const addError = ref('')
const firstNameInput = useTemplateRef<HTMLInputElement>('firstNameInput')

async function toggleAddForm() {
  showAddForm.value = !showAddForm.value
  if (!showAddForm.value) return
  const words = searchText.value.trim().split(/\s+/).filter(Boolean)
  lastName.value = words.length > 1 ? words.pop()! : ''
  firstName.value = words.join(' ')
  addError.value = ''
  await nextTick()
  firstNameInput.value?.focus()
}

async function submitNewStudent() {
  addError.value = ''
  try {
    await addStudent(firstName.value, lastName.value)
    status.value = `Added ${firstName.value.trim()} ${lastName.value.trim()} to your students`
    showAddForm.value = false
    searchText.value = '' // back to My Students, where the new student now appears
  } catch (e: any) {
    addError.value = e?.data?.statusMessage || 'Could not add student'
  }
}
</script>

<template>
  <SearchBar v-model="searchText" placeholder="Search all students">
    <button
      class="btn w-[42px] p-0 text-2xl leading-none font-bold"
      :aria-label="showAddForm ? 'Cancel adding a student' : 'Add a new student'"
      :aria-expanded="showAddForm"
      @click="toggleAddForm"
    >{{ showAddForm ? '×' : '+' }}</button>

    <template #below>
      <form v-if="showAddForm" class="mt-2 flex flex-wrap gap-1.5" @submit.prevent="submitNewStudent">
        <input ref="firstNameInput" v-model="firstName" class="field flex-[1_1_130px]" placeholder="First name" autocapitalize="words" required>
        <input v-model="lastName" class="field flex-[1_1_130px]" placeholder="Last name" autocapitalize="words" required>
        <button class="btn">Add</button>
        <p v-if="addError" class="m-0 w-full text-red-700">{{ addError }}</p>
      </form>
    </template>
  </SearchBar>

  <p v-if="status" class="mt-1 mb-2 font-bold text-club-teal">{{ status }}</p>

  <ListHeader>
    <input v-if="visibleStudents.length" type="checkbox" :checked="allVisibleSelected" aria-label="Select all" @change="toggleAllVisible">
    <h2>{{ isSearching ? 'Results' : 'My Students' }}</h2>
    <span v-if="isSearching && checkingServer" class="text-sm italic">checking for more…</span>
  </ListHeader>

  <ul>
    <!--
      Row layout: [☐ name  points] [›] | [★]
      Tapping the name area selects the student; › opens their page; the star sits alone at
      the far right behind a divider. Both buttons are 44×44px so thumbs don't hit the wrong one.
    -->
    <li
      v-for="s in visibleStudents"
      :key="s.id"
      class="flex items-center border-b border-silver"
      :class="selectedIds.has(s.id) && 'bg-navy text-white'"
    >
      <label class="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 px-1.5 py-2.5">
        <input type="checkbox" :checked="selectedIds.has(s.id)" @change="toggleSelected(s.id)">
        <span class="min-w-0 flex-1 truncate">{{ fullName(s) }}</span>
        <span class="font-bold tabular-nums">{{ s.points }}</span>
      </label>
      <NuxtLink
        :to="`/instructor/students/${s.id}`"
        class="flex size-11 items-center justify-center text-3xl leading-none no-underline"
        :class="selectedIds.has(s.id) ? 'text-white!' : 'text-black!'"
        :aria-label="`Open ${fullName(s)}`"
      >›</NuxtLink>
      <button
        class="ml-3 flex size-11 cursor-pointer items-center justify-center border-l border-silver text-2xl"
        :class="isFavorite(s.id) ? 'text-club-orange' : 'text-gray-400'"
        :aria-label="isFavorite(s.id) ? 'Remove from my students' : 'Add to my students'"
        @click="toggleFavorite(s.id)"
      >{{ isFavorite(s.id) ? '★' : '☆' }}</button>
    </li>
    <li v-if="!visibleStudents.length" class="px-1.5 py-3.5 text-gray-600 italic">
      <template v-if="!isSearching">No starred students yet. Search above and click ☆ to keep your regulars here.</template>
      <template v-else-if="checkingServer">Searching…</template>
      <template v-else>No matches. Click + to add them as a new student.</template>
    </li>
  </ul>

  <!-- Pinned to the bottom of the screen while anyone is selected; the spacer keeps the list scrollable past it. -->
  <template v-if="selectedIds.size">
    <div class="h-44" />
    <div class="fixed inset-x-0 bottom-0 z-20 border-t-2 border-white bg-silver pt-2 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--color-shade)]">
      <div class="mx-auto max-w-3xl px-3">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 whitespace-nowrap">
          <b>{{ selectedIds.size }} selected</b>
          <a href="#" @click.prevent="selectedIds.clear()">Clear</a>
          <button v-for="s in selectedStudents" :key="s.id" class="btn px-2 py-0.5 text-sm" @click="toggleSelected(s.id)">
            {{ fullName(s) }} ×
          </button>
        </div>
        <PointsForm :give="giveToSelected" />
      </div>
    </div>
  </template>
</template>
