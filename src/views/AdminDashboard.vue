<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { Button } from '@/components/ui/button';
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-full p-4 text-center">
    <h1 class="text-4xl font-bold mb-6">Admin Dashboard</h1>
    <p class="text-lg mb-8">This is where your CSV table and CRUD functions will be.</p>
    <RouterLink to="/">
      <Button variant="outline">Back to Home</Button>
    </RouterLink>
  </div>
</template>

<style scoped>
/* No specific styles needed here, Tailwind handles it */
</style>