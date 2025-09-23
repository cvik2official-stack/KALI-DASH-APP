<script setup lang="ts">
import { RouterView } from 'vue-router';
import MadeWithDyad from './components/MadeWithDyad.vue';
import { Toaster } from '@/components/ui/sonner';
</script>

<template>
  <div class="app-layout">
    <RouterView />
    <MadeWithDyad />
    <Toaster />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}
</style>