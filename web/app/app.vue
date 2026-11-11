<!--
  app.vue: the frame around every page: the header, then the current page.

  The student-facing site lives at / and the instructor site under /instructor.
  The header adapts: on student pages it links to the instructor area; inside the
  instructor area it shows who is logged in and a Log out link.

  logout()  ends the instructor's session and reloads the app, which also empties
            the browser's student cache (see composables/useRoster.ts).
-->
<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
const route = useRoute()
const inInstructorArea = computed(() => route.path.startsWith('/instructor'))

async function logout() {
  await clear()
  reloadNuxtApp({ path: '/instructor/login' })
}
</script>

<template>
  <header class="mx-auto flex max-w-3xl items-baseline justify-between border-b-[3px] border-double border-black px-3 pt-2.5 pb-1.5">
    <NuxtLink :to="inInstructorArea ? '/instructor' : '/'" class="text-[28px] font-bold text-black! no-underline">
      BCRC <span class="text-club-teal">Points</span>
    </NuxtLink>
    <div class="flex gap-3 text-[15px]">
      <template v-if="inInstructorArea && loggedIn">
        <span class="max-[420px]:hidden">{{ user?.name || user?.username }}</span>
        <a href="#" @click.prevent="logout">Log out</a>
      </template>
      <NuxtLink v-else-if="!inInstructorArea" to="/instructor">Instructors</NuxtLink>
    </div>
  </header>
  <main class="mx-auto max-w-3xl px-3 pb-8">
    <NuxtPage />
  </main>
</template>
