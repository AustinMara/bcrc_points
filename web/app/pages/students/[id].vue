<script setup lang="ts">
const route = useRoute()
const studentId = Number(route.params.id)

const { isFavorite, loadFavorites, awardPoints, toggleFavorite } = useRoster()
await loadFavorites() // cached after the first page, so this is free when coming from the home page

const { data, refresh, error } = await useFetch<StudentDetail>(`/api/students/${studentId}`)

async function give(points: number, reason: string) {
  await awardPoints([studentId], points, reason)
  await refresh() // reload this student's total and history
}
</script>

<template>
  <NuxtLink to="/" class="back">‹ Back</NuxtLink>
  <p v-if="error" class="error">Student not found.</p>
  <template v-else-if="data">
    <div class="student-header">
      <div>
        <h1>{{ fullName(data.student) }}</h1>
        <p class="total"><span class="num">{{ data.student.points }}</span> points</p>
      </div>
      <button class="star" :class="{ on: isFavorite(studentId) }" @click="toggleFavorite(studentId)">
        {{ isFavorite(studentId) ? '★ Starred' : '☆ Star' }}
      </button>
    </div>

    <PointsForm :give="give" />

    <h2>History</h2>
    <ul class="history">
      <li v-for="h in data.history" :key="h.id">
        <span>{{ h.points_reason || '—' }}</span>
        <span class="num" :class="{ negative: h.points_value < 0 }">{{ signed(h.points_value) }}</span>
      </li>
      <li v-if="!data.history.length" class="muted">No points yet.</li>
    </ul>
  </template>
</template>

<style scoped>
.back { display: inline-block; padding: 10px 0 4px; }
.student-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
h1 { font-size: 28px; margin: 4px 0 0; }
.total { margin: 0; }
.total .num { font-weight: bold; font-size: 20px; }
.star { white-space: nowrap; }
.star.on { color: var(--orange); }
h2 { font-size: 20px; margin: 24px 0 0; padding-bottom: 4px; border-bottom: 3px double #000; }
.history { list-style: none; margin: 0; padding: 0; }
.history li { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--silver); }
.history .num { font-weight: bold; }
.negative { color: #c00; }
</style>
