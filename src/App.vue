<script setup lang="ts">
import { RouterView } from 'vue-router';
import MadeWithDyad from './components/MadeWithDyad.vue';
// MenuPanel is now handled within AdminDashboard via Sheet
import { Toaster } from '@/components/ui/sonner';
</script>

<template>
  <div class="app-layout flex flex-col">
    <RouterView />
    <MadeWithDyad />
    <Toaster />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
</style>