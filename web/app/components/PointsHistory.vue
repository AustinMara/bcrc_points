<!--
  PointsHistory.vue: a student's points ledger: each award's reason and amount, newest first,
  under a "History" heading. Used by the public ledger page and the instructor student page.
-->
<script setup lang="ts">
defineProps<{ history: PointsEntry[] }>()
</script>

<template>
  <h2 class="mt-6 border-b-[3px] border-double border-black pb-1 text-xl font-bold">History</h2>
  <ul>
    <li v-for="h in history" :key="h.id" class="flex justify-between gap-3 border-b border-silver py-2.5">
      <span v-if="h.points_reason">{{ h.points_reason }}</span>
      <span v-else class="text-gray-600 italic">{{ h.points_value < 0 ? 'Points removed' : 'Points awarded' }}</span>
      <span class="font-bold tabular-nums" :class="h.points_value < 0 ? 'text-red-700' : 'text-club-teal'">
        {{ signed(h.points_value) }}
      </span>
    </li>
    <li v-if="!history.length" class="py-2.5 text-gray-600 italic">No points yet.</li>
  </ul>
</template>
