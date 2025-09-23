<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Button } from '@/components/ui/button';
import { loadCsvData } from '@/lib/csvUtils';
import CsvTable from '@/components/CsvTable.vue';
import { showInfoToast, showErrorToast, showSuccessToast } from '@/lib/toast';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-vue-next';
import MenuPanel from '@/components/MenuPanel.vue'; // Import MenuPanel

interface CsvRow {
  [key: string]: string;
}

const csvData = ref<CsvRow[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isMenuOpen = ref(false); // State to control the sheet

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
    <div class="w-full flex justify-between items-center mb-6">
      <Sheet v-model:open="isMenuOpen">
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="md:hidden">
            <Menu class="h-4 w-4" />
            <span class="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="p-0 w-64">
          <MenuPanel />
        </SheetContent>
      </Sheet>
      <h1 class="text-4xl font-bold flex-1">Admin Dashboard</h1>
    </div>
    
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