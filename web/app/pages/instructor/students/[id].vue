<!--
  pages/instructor/students/[id].vue: one student's page (/instructor/students/:id). Login required.

  Shows the student's full name and total, a star toggle, the points form, and their
  points history (newest first, drawn by components/PointsHistory.vue). "‹ Back" works like
  the browser's Back button (see components/BackLink.vue).

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
  <BackLink fallback="/instructor" />
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

    <PointsHistory :history="data.history" />
  </template>
</template>
