<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await clear()
  reloadNuxtApp({ path: '/login' }) // full reload also empties the student cache
}
</script>

<template>
  <header class="container site-header">
    <NuxtLink to="/" class="brand">BCRC <span>Points</span></NuxtLink>
    <div v-if="loggedIn" class="who">
      <span class="who-name">{{ user?.name || user?.username }}</span>
      <a href="#" @click.prevent="logout">Log out</a>
    </div>
  </header>
  <main class="container">
    <NuxtPage />
  </main>
</template>

<style>
/*
  A plain 90s web page: gray beveled buttons, sunken inputs, blue links.
  Club colors (bellinghamcodingclub.com) stay as accents: teal and orange.
*/
:root {
  --teal: #1e7c83; /* darker club teal, readable on white */
  --orange: #fd5c12;
  --silver: #c0c0c0;
  --light: #ffffff;
  --shadow: #808080;
  --navy: #000080; /* classic selection color */
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
body {
  margin: 0;
  background: #fff;
  color: #000;
  font: 17px/1.5 Lexend, Verdana, sans-serif;
  -webkit-text-size-adjust: 100%;
}
.container { max-width: 720px; margin: 0 auto; padding: 0 12px; }
main { padding-bottom: 32px; }

.site-header { display: flex; justify-content: space-between; align-items: baseline; padding-top: 10px; padding-bottom: 6px; border-bottom: 3px double #000; }
.brand, .brand:visited { color: #000; font-size: 28px; font-weight: bold; text-decoration: none; }
.brand span { color: var(--teal); }
.who { display: flex; gap: 12px; font-size: 15px; }
@media (max-width: 420px) { .who-name { display: none; } }

a { color: #0000ee; }
a:visited { color: #551a8b; }
h1, h2, h3 { font-weight: bold; }

/* Raised gray buttons; pressed looks sunken. */
input, button { font: inherit; border-radius: 0; }
button {
  padding: 6px 14px;
  background: var(--silver);
  color: #000;
  font-size: 16px;
  border: 2px solid;
  border-color: var(--light) var(--shadow) var(--shadow) var(--light);
  box-shadow: 1px 1px 0 #000;
  cursor: pointer;
}
button:active:not(:disabled) { border-color: var(--shadow) var(--light) var(--light) var(--shadow); box-shadow: none; }
button:disabled { color: var(--shadow); text-shadow: 1px 1px 0 var(--light); cursor: default; }
button.hot { background: var(--orange); font-weight: bold; font-size: 18px; }

/* Sunken white inputs. 16px+ text stops iPhones from zooming in on focus. */
input {
  min-width: 0;
  padding: 6px 8px;
  background: #fff;
  color: #000;
  border: 2px solid;
  border-color: var(--shadow) var(--light) var(--light) var(--shadow);
  box-shadow: inset 1px 1px 0 #000;
}
input:focus { outline: 1px dotted #000; outline-offset: 2px; }
input[type="checkbox"] { width: 20px; height: 20px; margin: 0; flex-shrink: 0; box-shadow: none; }

.muted { color: #555; }
.error { color: #c00; }
.row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.num { font-variant-numeric: tabular-nums; }
</style>
