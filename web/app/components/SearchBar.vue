<!--
  SearchBar.vue: the search box both sites use. It sticks to the top of the screen while
  scrolling. Bind the text with v-model; anything placed inside the tag (like the
  instructor page's + button) sits to the right of the box, and the `below` slot sits under it.

  Props:
    placeholder   the hint text, also used as the box's accessible label
    large         a big, easy-to-see box in a gray raised frame, with a thick blinking
                  retro block cursor (the student site's main search)
    autofocus     put the cursor in the box as soon as the page appears

  The retro cursor: browsers can't make the real text cursor thicker, so in large mode the
  real one is hidden and a black block is drawn after the typed text instead. An invisible
  copy of the text in the same font pushes the block to the right spot. The block only
  shows while the cursor is at the end of the text; if it moves (arrow keys, a click inside
  the text, a selection), the normal cursor comes back until it returns to the end.

  checkCaret()  records whether the cursor is at the end of the text (and nothing is selected).
                Runs after anything that can move the cursor.
-->
<script setup lang="ts">
const props = defineProps<{ placeholder: string; large?: boolean; autofocus?: boolean }>()
const text = defineModel<string>({ required: true })

const input = useTemplateRef<HTMLInputElement>('input')
const focused = ref(false)
const caretAtEnd = ref(true)
const showBlock = computed(() => props.large && focused.value && caretAtEnd.value)

function checkCaret() {
  const el = input.value
  if (!el) return
  const end = el.value.length
  caretAtEnd.value = el.selectionStart === end && el.selectionEnd === end
}

onMounted(() => {
  if (props.autofocus) input.value?.focus()
})
</script>

<template>
  <div class="sticky top-0 z-10 bg-white pt-2.5 pb-2">
    <div class="flex gap-1.5" :class="large && 'bevel-out bg-silver p-2'">
      <div class="relative flex-1">
        <input
          ref="input"
          v-model="text"
          type="search"
          class="field w-full"
          :class="[
            large && 'px-4 py-3.5 text-2xl',
            showBlock && 'caret-transparent',
          ]"
          :placeholder="placeholder"
          :aria-label="placeholder"
          enterkeyhint="search"
          autocomplete="off"
          @focus="focused = true; checkCaret()"
          @blur="focused = false"
          @input="checkCaret"
          @keyup="checkCaret"
          @click="checkCaret"
          @select="checkCaret"
          @selectionchange="checkCaret"
        >
        <!-- The retro block cursor (large mode only), drawn over the box. -->
        <div
          v-if="showBlock"
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 flex items-center overflow-hidden px-[18px] text-2xl"
        >
          <span class="invisible whitespace-pre">{{ text }}</span>
          <span class="ml-0.5 h-[1.1em] w-[0.55em] shrink-0 animate-blink bg-black motion-reduce:animate-none" />
        </div>
      </div>
      <slot />
    </div>
    <slot name="below" />
  </div>
</template>
