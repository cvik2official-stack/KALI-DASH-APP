<script setup lang="ts">
import { RouterView } from 'vue-router';
import MadeWithDyad from './components/MadeWithDyad.vue';
import MenuPanel from './components/MenuPanel.vue'; // Import the new MenuPanel
import { Toaster } from '@/components/ui/sonner';
</script>

<template>
  <div class="app-layout flex flex-col md:flex-row">
    <MenuPanel class="hidden md:flex" /> <!-- MenuPanel for desktop -->
    <div class="flex-1 flex flex-col">
      <RouterView />
      <MadeWithDyad />
    </div>
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