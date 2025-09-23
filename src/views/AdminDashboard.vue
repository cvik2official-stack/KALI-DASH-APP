<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Button } from '@/components/ui/button';
import { loadCsvData } from '@/lib/csvUtils';
import CsvTable from '@/components/CsvTable.vue';
import { showInfoToast, showErrorToast, showSuccessToast } from '@/lib/toast';

interface CsvRow {
  [key: string]: string;
}

const csvData = ref<CsvRow[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  showInfoToast('Loading CSV data...');
  try {
    // Updated path to fetch from the public directory
    const data = await loadCsvData('/data/grocery-list.csv');
    csvData.value = data;
    showSuccessToast('CSV data loaded successfully!');
  } catch (e: any) {
    error.value = e.message || 'Failed to load CSV data.';
    showErrorToast(error.value);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-full p-4 text-center">
    <h1 class="text-4xl font-bold mb-6">Admin Dashboard</h1>
    <p class="text-lg mb-8">Manage your CSV data below.</p>

    <div v-if="isLoading" class="text-xl text-gray-600 dark:text-gray-300">Loading data...</div>
    <div v-else-if="error" class="text-xl text-red-600 dark:text-red-400">Error: {{ error }}</div>
    <div v-else-if="csvData.length > 0" class="w-full max-w-4xl">
      <CsvTable :initial-data="csvData" />
    </div>
    <div v-else class="text-xl text-gray-600 dark:text-gray-300">No CSV data available.</div>

    <RouterLink to="/" class="mt-8">
      <Button variant="outline">Back to Home</Button>
    </RouterLink>
  </div>
</template>

<style scoped>
/* No specific styles needed here, Tailwind handles it */
</style>