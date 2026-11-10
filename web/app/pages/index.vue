<script setup lang="ts">
const {
  favorites, isFavorite, lookup, loadFavorites,
  searchCache, cacheHasAllMatches, fetchMatches,
  awardPoints, addStudent, toggleFavorite,
} = useRoster()
await loadFavorites()

// --- Search: show cached matches instantly, then ask the server only if needed ---
const searchText = ref('')
const isSearching = computed(() => searchText.value.trim() !== '')
const checkingServer = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(searchText, (text) => {
  clearTimeout(searchTimer)
  if (!text.trim() || cacheHasAllMatches(text)) return
  // Wait until typing pauses so we don't send a request per keystroke.
  searchTimer = setTimeout(async () => {
    checkingServer.value = true
    try {
      await fetchMatches(text)
    } finally {
      checkingServer.value = false
    }
  }, 200)
})

// Both lists are computed from the cache, so new server results and point changes appear automatically.
const visibleStudents = computed(() => (isSearching.value ? searchCache(searchText.value) : favorites.value))

// --- Selection: kept while you search, so you can pick students from several searches ---
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

// --- Giving points to everyone selected (PointsForm calls this) ---
const status = ref('')

async function giveToSelected(points: number, reason: string) {
  const count = selectedIds.value.size
  await awardPoints([...selectedIds.value], points, reason)
  status.value = `${signed(points)} points to ${count} student${count === 1 ? '' : 's'}`
  selectedIds.value.clear()
}

// --- Adding a student: the + next to search opens a form, pre-filled from the search text ---
const showAddForm = ref(false)
const firstName = ref('')
const lastName = ref('')
const addError = ref('')
const firstNameInput = useTemplateRef<HTMLInputElement>('firstNameInput')

async function toggleAddForm() {
  showAddForm.value = !showAddForm.value
  if (!showAddForm.value) return
  // "Jane Doe" -> first "Jane", last "Doe"; a single word becomes the first name.
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
    searchText.value = '' // back to "My students", where the new student now appears
  } catch (e: any) {
    addError.value = e?.data?.statusMessage || 'Could not add student'
  }
}
</script>

<template>
  <div class="search-bar">
    <div class="search-row">
      <input v-model="searchText" type="search" placeholder="Search all students" aria-label="Search all students" enterkeyhint="search">
      <button
        class="plus"
        :aria-label="showAddForm ? 'Cancel adding a student' : 'Add a new student'"
        :aria-expanded="showAddForm"
        @click="toggleAddForm"
      >{{ showAddForm ? '×' : '+' }}</button>
    </div>
    <form v-if="showAddForm" class="add-form" @submit.prevent="submitNewStudent">
      <input ref="firstNameInput" v-model="firstName" placeholder="First name" autocapitalize="words" required>
      <input v-model="lastName" placeholder="Last name" autocapitalize="words" required>
      <button>Add</button>
      <p v-if="addError" class="error">{{ addError }}</p>
    </form>
  </div>

  <p v-if="status" class="status">{{ status }}</p>

  <div class="list-header">
    <input
      v-if="visibleStudents.length"
      type="checkbox"
      :checked="allVisibleSelected"
      aria-label="Select all"
      @change="toggleAllVisible"
    >
    <h2>{{ isSearching ? 'Results' : 'My Students' }}</h2>
    <span v-if="isSearching && checkingServer" class="small">checking for more…</span>
  </div>

  <ul class="student-list">
    <!-- Tapping anywhere on the row selects it; the › opens the student's page. -->
    <li v-for="s in visibleStudents" :key="s.id" :class="{ selected: selectedIds.has(s.id) }">
      <label class="pick">
        <input type="checkbox" :checked="selectedIds.has(s.id)" @change="toggleSelected(s.id)">
        <span class="name">{{ fullName(s) }}</span>
        <span class="points num">{{ s.points }}</span>
      </label>
      <button
        class="star"
        :class="{ on: isFavorite(s.id) }"
        :aria-label="isFavorite(s.id) ? 'Remove from my students' : 'Add to my students'"
        @click="toggleFavorite(s.id)"
      >{{ isFavorite(s.id) ? '★' : '☆' }}</button>
      <NuxtLink :to="`/students/${s.id}`" class="open" :aria-label="`Open ${fullName(s)}`">›</NuxtLink>
    </li>
    <li v-if="!visibleStudents.length" class="empty muted">
      <template v-if="!isSearching">No starred students yet. Search above and click ☆ to keep your regulars here.</template>
      <template v-else-if="checkingServer">Searching…</template>
      <template v-else>No matches. Click + to add them as a new student.</template>
    </li>
  </ul>

  <!-- Pinned to the bottom of the screen while anyone is selected -->
  <div v-if="selectedIds.size" class="bar-spacer" />
  <div v-if="selectedIds.size" class="award-bar">
    <div class="container">
      <div class="chips">
        <b>{{ selectedIds.size }} selected</b>
        <a href="#" @click.prevent="selectedIds.clear()">Clear</a>
        <button v-for="s in selectedStudents" :key="s.id" class="chip" @click="toggleSelected(s.id)">
          {{ fullName(s) }} ×
        </button>
      </div>
      <PointsForm :give="giveToSelected" />
    </div>
  </div>
</template>

<style scoped>
.search-bar { position: sticky; top: 0; z-index: 2; background: #fff; padding: 10px 0 8px; }
.search-row { display: flex; gap: 6px; }
.search-row input { flex: 1; }
.plus { width: 42px; padding: 0; font-size: 24px; font-weight: bold; line-height: 1; }
.add-form { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.add-form input { flex: 1 1 130px; }
.add-form .error { width: 100%; margin: 0; }

.status { margin: 4px 0 8px; font-weight: bold; color: var(--teal); }

/* Gray beveled bar, like an old table header */
.list-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px;
  background: var(--silver);
  border: 2px solid;
  border-color: var(--light) var(--shadow) var(--shadow) var(--light);
}
.list-header h2 { margin: 0; font-size: 17px; }
.small { font-size: 14px; font-style: italic; }

.student-list { list-style: none; margin: 0; padding: 0; }
.student-list li { display: flex; align-items: center; border-bottom: 1px solid var(--silver); }
.student-list li.selected { background: var(--navy); color: #fff; }
.student-list li.selected .open { color: #fff; }
.pick { flex: 1; min-width: 0; display: flex; align-items: center; gap: 10px; padding: 10px 6px; cursor: pointer; }
.name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.points { font-weight: bold; }
.star { background: none; border: 0; box-shadow: none; color: #888; font-size: 20px; padding: 6px 8px; }
.star.on { color: var(--orange); }
.open { color: #000; text-decoration: none; font-size: 24px; padding: 2px 8px 6px; line-height: 1; }
.empty { padding: 14px 6px; font-style: italic; }

.bar-spacer { height: 170px; }
.award-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  background: var(--silver);
  border-top: 2px solid var(--light);
  box-shadow: 0 -1px 0 var(--shadow);
  padding: 8px 0 calc(10px + env(safe-area-inset-bottom));
}
.chips { display: flex; gap: 6px; align-items: center; overflow-x: auto; white-space: nowrap; padding-bottom: 8px; }
.chip { font-size: 14px; padding: 2px 8px; }
</style>
