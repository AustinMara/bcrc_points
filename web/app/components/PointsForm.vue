<!--
  PointsForm.vue: reason box, custom points box, Give, and a one-tap +50.
  Used by the instructor home page (for everyone selected) and a student's page.

  Props:
    give(points, reason)  does the actual saving; the parent decides who gets the points.
  Functions:
    submit(points)        calls give(), shows a busy state and any error, and clears
                          the form after a successful save.
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
  <form class="grid grid-cols-[minmax(0,1fr)] gap-2" @submit.prevent="submit(amount)">
    <input v-model="reason" class="field" placeholder="Reason (optional)" maxlength="64">
    <div class="flex gap-2">
      <input v-model.number="amount" type="number" step="1" class="field flex-1" placeholder="Points" aria-label="Points to give">
      <button type="submit" class="btn" :disabled="busy || !amount">Give</button>
      <button type="button" class="btn btn-hot" :disabled="busy" @click="submit(QUICK_POINTS)">{{ signed(QUICK_POINTS) }}</button>
    </div>
    <p v-if="error" class="m-0 text-sm text-red-700">{{ error }}</p>
  </form>
</template>
