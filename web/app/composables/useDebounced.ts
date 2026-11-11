/**
 * A copy of `source` that only updates after it has stopped changing for `ms` milliseconds.
 * Used for search boxes, so we search when typing pauses instead of on every keystroke.
 */
export function useDebounced<T>(source: Ref<T>, ms = 200): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => (debounced.value = value), ms)
  })
  return debounced
}
