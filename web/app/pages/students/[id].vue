<!--
  pages/students/[id].vue: a student's public ledger (/students/:id). No login.

  Shows first name + last initial, the total, and every points entry (reason and amount).
  "‹ Back to search" works like the browser's Back button (see components/BackLink.vue).
-->
<script setup lang="ts">
const route = useRoute()
const { data, error } = await useFetch<PublicStudentDetail>(`/api/public/students/${route.params.id}`)
</script>

<template>
  <div class="mx-auto max-w-xl">
    <BackLink fallback="/">‹ Back to search</BackLink>

    <p v-if="error" class="mt-4 text-red-700">We couldn't find that student.</p>

    <template v-else-if="data">
      <div class="mt-4 text-center">
        <h1 class="text-[30px] font-bold">{{ publicName(data.student) }}</h1>
        <p class="mt-1">
          <span class="text-5xl font-bold text-club-teal tabular-nums">{{ data.student.points }}</span>
          <span class="ml-1 text-xl">{{ data.student.points === 1 ? 'point' : 'points' }}</span>
        </p>
      </div>

      <PointsHistory :history="data.history" />
    </template>
  </div>
</template>
