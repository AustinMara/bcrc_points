<!--
  PointsHistory.vue: a student's points ledger: each award's reason, date, and amount,
  newest first, under a "History" heading. Older points with no recorded date show no date. Used by the public ledger page and the instructor student page.
-->
<script setup lang="ts">
defineProps<{ history: PointsEntry[] }>()
</script>

<template>
  <h2 class="mt-6 border-b-[3px] border-double border-line pb-1 text-xl font-bold">History</h2>
  <ul>
    <li v-for="h in history" :key="h.id" class="flex items-center justify-between gap-3 border-b border-line py-2.5">
      <div>
        <span v-if="h.points_reason">{{ h.points_reason }}</span>
        <span v-else class="text-muted italic">{{ h.points_value < 0 ? 'Points removed' : 'Points awarded' }}</span>
        <time v-if="h.created_at" class="block text-sm text-muted" :datetime="h.created_at.replace(' ', 'T') + 'Z'">
          {{ formatDate(h.created_at) }}
        </time>
      </div>
      <span class="font-bold tabular-nums" :class="h.points_value < 0 ? 'text-danger' : 'text-club-teal'">
        {{ signed(h.points_value) }}
      </span>
    </li>
    <li v-if="!history.length" class="py-2.5 text-muted italic">No points yet.</li>
  </ul>
</template>
