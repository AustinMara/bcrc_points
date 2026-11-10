<!--
  Reason + custom amount + Give + a one-tap +50.
  The parent passes `give`, which does the actual saving; this form handles
  the busy state, errors, and clearing itself after a successful save.
-->
<script setup lang="ts">
const props = defineProps<{ give: (points: number, reason: string) => Promise<void> }>()

const QUICK_POINTS = 50

const amount = ref<number | null>(null)
const reason = ref('')
const busy = ref(false)
const error = ref('')

async function submit(points: number | null) {
  if (!points) return
  busy.value = true
  error.value = ''
  try {
    await props.give(points, reason.value)
    amount.value = null
    reason.value = ''
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Could not save points'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="points-form" @submit.prevent="submit(amount)">
    <input v-model="reason" placeholder="Reason (optional)" maxlength="64">
    <div class="amount-row">
      <input v-model.number="amount" type="number" step="1" placeholder="Points" aria-label="Points to give">
      <button type="submit" :disabled="busy || !amount">Give</button>
      <button type="button" class="hot" :disabled="busy" @click="submit(QUICK_POINTS)">{{ signed(QUICK_POINTS) }}</button>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<style scoped>
.points-form { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
.amount-row { display: flex; gap: 8px; }
.amount-row input { flex: 1; }
.error { margin: 0; font-size: 14px; }
</style>
