<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()
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
    await navigateTo('/')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Login failed'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="login" @submit.prevent="login">
    <h1>Instructor login</h1>
    <input v-model="username" placeholder="Username" autocomplete="username" autocapitalize="none" required>
    <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" required>
    <button :disabled="busy">Log in</button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<style scoped>
.login { display: grid; gap: 12px; max-width: 360px; margin: 48px auto 0; }
h1 { font-size: 26px; margin: 0 0 4px; }
button { justify-self: start; }
.error { margin: 0; }
</style>
