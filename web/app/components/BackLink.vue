<!--
  BackLink.vue: a "‹ Back" link that does exactly what the browser's Back button does:
  it returns to the previous page (same search, same address) without adding a new
  history entry. If the page was opened directly and there's nothing in this site to go
  back to, it goes to `fallback` instead.

  goBack()  router.back() when the previous page was in this site, otherwise go to fallback.
-->
<script setup lang="ts">
const props = defineProps<{ fallback: string }>()
const router = useRouter()

function goBack() {
  if (router.options.history.state.back) router.back()
  else navigateTo(props.fallback)
}
</script>

<template>
  <a :href="fallback" class="inline-block pt-2.5 pb-1" @click.prevent="goBack"><slot>‹ Back</slot></a>
</template>
