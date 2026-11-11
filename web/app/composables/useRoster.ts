/**
 * The browser-side student cache, shared by every page.
 *
 * Each student is stored once, by id, in `cache`. Lists only hold ids (or are
 * computed from the cache), so when points change we update the one cached
 * object and every list showing that student updates with it.
 *
 * Searching checks the cache first, so results appear instantly. The server is
 * only asked when the cache might be missing matches.
 *
 * favorites                     the instructor's starred students (from the cache)
 * isFavorite(id)                is this student starred?
 * lookup(ids)                   turn ids back into students
 * loadFavorites()               fetch starred students once per visit
 * searchCache(text)             instant: cached students whose name contains the text
 * cacheHasAllMatches(text)      true if an earlier complete search already covers this one
 * fetchMatches(text)            ask the server for matches the cache might be missing
 * awardPoints(ids, value, why)  save points, then update the cached totals
 * addStudent(first, last)       add a student (the server stars them for you)
 * toggleFavorite(id)            star or unstar a student (unstarred students stay listed with
 *                               a hollow ☆ until the next page load, so a mis-tap is easy to undo)
 */
export function useRoster() {
  const cache = useState<Record<number, Student>>('roster:cache', () => ({}))
  const favoriteIds = useState<number[]>('roster:favorite-ids', () => [])
  // Searches the server fully answered (fewer than SEARCH_LIMIT results), so every match is now cached.
  const completeSearches = useState<string[]>('roster:complete-searches', () => [])
  const requestFetch = useRequestFetch() // like $fetch, but passes the login cookie along during server rendering

  /** Store students in the cache and return their ids. */
  function remember(students: Student[]): number[] {
    for (const student of students) cache.value[student.id] = student
    return students.map((student) => student.id)
  }

  /** Turn a list of ids back into students. */
  function lookup(ids: number[]): Student[] {
    return ids.map((id) => cache.value[id]).filter((student) => student !== undefined)
  }

  // Students unstarred during this visit. They stay in the My Students list (with a hollow ☆)
  // until the next page load, so a mis-tap on the star can be undone with one more tap.
  const unstarredIds = useState<number[]>('roster:unstarred-ids', () => [])

  const favorites = computed(() => lookup(favoriteIds.value))
  const isFavorite = (id: number) => favoriteIds.value.includes(id) && !unstarredIds.value.includes(id)

  /** Load the instructor's starred students once per visit. Later pages reuse the cache. */
  function loadFavorites() {
    return callOnce('roster:favorites', async () => {
      favoriteIds.value = remember(await requestFetch<Student[]>('/api/favorites'))
    })
  }

  // --- Search ---

  const normalize = (text: string) => text.trim().toLowerCase()

  /** Instant: cached students whose name contains the text (same rule as the server's LIKE search). */
  function searchCache(text: string): Student[] {
    const needle = normalize(text)
    return Object.values(cache.value)
      .filter((student) => fullName(student).toLowerCase().includes(needle))
      .sort(byName)
  }

  /**
   * True when the cache already holds every match. If "ad" was fully answered,
   * anything matching "ada" also matched "ad", so it's already cached.
   */
  function cacheHasAllMatches(text: string): boolean {
    const needle = normalize(text)
    return completeSearches.value.some((done) => needle.includes(done))
  }

  /** Ask the server for matches the cache might be missing. They land in the cache, so searchCache() shows them. */
  async function fetchMatches(text: string) {
    if (cacheHasAllMatches(text)) return
    const results = await $fetch<Student[]>('/api/students', { query: { q: text.trim() } })
    remember(results)
    if (results.length < SEARCH_LIMIT) completeSearches.value.push(normalize(text))
  }

  // --- Changes ---

  async function awardPoints(studentIds: number[], value: number, reason: string) {
    remember(await $fetch<Student[]>('/api/points', { method: 'POST', body: { student_ids: studentIds, value, reason } }))
  }

  function addToFavorites(id: number) {
    unstarredIds.value = unstarredIds.value.filter((u) => u !== id)
    if (favoriteIds.value.includes(id)) return // re-starred before leaving the page: it never left the list
    favoriteIds.value = lookup([...favoriteIds.value, id]).sort(byName).map((student) => student.id)
  }

  async function addStudent(firstName: string, lastName: string) {
    const student = await $fetch<Student>('/api/students', {
      method: 'POST',
      body: { first_name: firstName, last_name: lastName },
    })
    remember([student])
    addToFavorites(student.id) // the server stars new students for whoever added them
  }

  async function toggleFavorite(id: number) {
    const star = !isFavorite(id)
    await $fetch(`/api/favorites/${id}`, { method: star ? 'PUT' : 'DELETE' })
    if (star) addToFavorites(id)
    else unstarredIds.value = [...unstarredIds.value, id]
  }

  return {
    favorites, isFavorite, lookup, loadFavorites,
    searchCache, cacheHasAllMatches, fetchMatches,
    awardPoints, addStudent, toggleFavorite,
  }
}
