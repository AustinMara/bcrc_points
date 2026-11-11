<!--
  SearchBar.vue: the search box both sites use. It sticks to the top of the screen while
  scrolling. Bind the text with v-model; anything placed inside the tag (like the
  instructor page's + button) sits to the right of the box, and the `below` slot sits under it.
-->
<script setup lang="ts">
defineProps<{ placeholder: string }>()
const text = defineModel<string>({ required: true })
</script>

<template>
  <div class="sticky top-0 z-10 bg-white pt-2.5 pb-2">
    <div class="flex gap-1.5">
      <input
        v-model="text"
        type="search"
        class="field flex-1"
        :placeholder="placeholder"
        :aria-label="placeholder"
        enterkeyhint="search"
        autocomplete="off"
      >
      <slot />
    </div>
    <slot name="below" />
  </div>
</template>
