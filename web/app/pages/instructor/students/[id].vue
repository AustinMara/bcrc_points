<!--
  pages/instructor/students/[id].vue: one student's page (/instructor/students/:id). Login required.

  Shows the student's full name and total, a star toggle, the points form, and their
  points history (newest first).

  give(points, reason)  saves points for this student (called by PointsForm), then
                        reloads the total and history. awardPoints() also updates the
                        browser cache, so the home page shows the new total too.
-->
<script setup lang="ts">
const route = useRoute()
const studentId = Number(route.params.id)

const { isFavorite, loadFavorites, awardPoints, toggleFavorite } = useRoster()
await loadFavorites() // already cached when coming from the home page

const { data, refresh, error } = await useFetch<StudentDetail>(`/api/students/${studentId}`)

async function give(points: number, reason: string) {
  await awardPoints([studentId], points, reason)
  await refresh()
}
</script>

<template>
  <NuxtLink to="/instructor" class="inline-block pt-2.5 pb-1">‹ Back</NuxtLink>
  <p v-if="error" class="text-red-700">Student not found.</p>

  <template v-else-if="data">
    <div class="mb-3 flex items-start justify-between gap-3">
      <div>
        <h1 class="mt-1 text-[28px] font-bold">{{ fullName(data.student) }}</h1>
        <p><span class="text-xl font-bold tabular-nums">{{ data.student.points }}</span> points</p>
      </div>
      <button class="btn whitespace-nowrap" :class="isFavorite(studentId) && 'text-club-orange'" @click="toggleFavorite(studentId)">
        {{ isFavorite(studentId) ? '★ Starred' : '☆ Star' }}
      </button>
    </div>

    <PointsForm :give="give" />

    <h2 class="mt-6 border-b-[3px] border-double border-black pb-1 text-xl font-bold">History</h2>
    <ul>
      <li v-for="h in data.history" :key="h.id" class="flex justify-between gap-3 border-b border-silver py-2">
        <span>{{ h.points_reason || '—' }}</span>
        <span class="font-bold tabular-nums" :class="h.points_value < 0 && 'text-red-700'">{{ signed(h.points_value) }}</span>
      </li>
      <li v-if="!data.history.length" class="py-2 text-gray-600">No points yet.</li>
    </ul>
  </template>
</template>
