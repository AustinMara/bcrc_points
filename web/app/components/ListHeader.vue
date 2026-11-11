<!--
  ListHeader.vue: the gray raised bar above a list, like an old table header.
  Put a title (and anything else, like a select-all checkbox) inside the tag.
-->
<template>
  <div class="bevel-out flex items-center gap-2.5 bg-silver px-1.5 py-1 [&_h2]:m-0 [&_h2]:text-[17px] [&_h2]:font-bold">
    <slot />
  </div>
</template>
