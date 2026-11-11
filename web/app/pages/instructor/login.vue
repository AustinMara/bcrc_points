<!--
  pages/instructor/login.vue: instructor login (/instructor/login).

  When no database is connected (demo mode), a yellow note shows the demo login.
  "‹ Back to student view" returns to the student site (/).

  login()  sends the username and password to /api/auth/login. On success it refreshes
           the session and goes to the instructor home page; otherwise it shows the error.
-->
<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()
const { data: demo } = await useFetch('/api/demo')

const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function login() {
  error.value = ''
  busy.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { username: username.value, password: password.value } })
    await refreshSession()
    await navigateTo('/instructor')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Login failed'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <!-- Replaces the login page in history, so the browser's Back doesn't return to it. -->
  <NuxtLink to="/" replace class="inline-block pt-2.5 pb-1">‹ Back to student view</NuxtLink>

  <form class="mx-auto mt-8 grid max-w-[360px] gap-3" @submit.prevent="login">
    <h1 class="mb-1 text-[26px] font-bold">Instructor login</h1>
    <p v-if="demo?.demo" class="border border-black bg-yellow-100 px-2.5 py-2 text-[15px]">
      <b>Demo mode:</b> no database is connected, so changes are temporary.
      Log in with <code>{{ demo.username }}</code> / <code>{{ demo.password }}</code>.
    </p>
    <input v-model="username" class="field" placeholder="Username" autocomplete="username" autocapitalize="none" required>
    <input v-model="password" type="password" class="field" placeholder="Password" autocomplete="current-password" required>
    <button class="btn justify-self-start" :disabled="busy">Log in</button>
    <p v-if="error" class="text-red-700">{{ error }}</p>
  </form>
</template>
