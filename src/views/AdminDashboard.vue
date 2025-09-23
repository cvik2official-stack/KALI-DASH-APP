<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
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
import MenuPanel from '@/components/MenuPanel.vue';

// New imports for resizable and tabs
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ColumnSettings from '@/components/ColumnSettings.vue'; // Will create this
import { useIsMobile } from '@/composables/useIsMobile'; // To handle responsive layout

interface CsvRow {
  [key: string]: string;
}

const csvData = ref<CsvRow[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isMenuOpen = ref(false); // State to control the mobile sheet menu

// State for column visibility
const columnVisibility = ref<Record<string, boolean>>({});
const availableColumns = ref<string[]>([]); // To store all possible columns from CSV

const isMobile = useIsMobile(); // Reactive mobile detection

onMounted(async () => {
  showInfoToast('Loading CSV data...');
  try {
    const data = await loadCsvData('/data/grocery-list.csv');
    csvData.value = data;
    if (data.length > 0) {
      const initialColumns = Object.keys(data[0]).filter(key => key !== 'id');
      availableColumns.value = initialColumns;
      // Initialize all columns as visible by default
      columnVisibility.value = initialColumns.reduce((acc, col) => ({ ...acc, [col]: true }), {});
    }
    showSuccessToast('CSV data loaded successfully!');
  } catch (e: any) {
    error.value = e.message || 'Failed to load CSV data.';
    showErrorToast(error.value);
  } finally {
    isLoading.value = false;
  }
});

// Function to update column visibility from ColumnSettings component
const updateColumnVisibility = (newVisibility: Record<string, boolean>) => {
  columnVisibility.value = newVisibility;
};

// Computed property to pass to CsvTable, filtering out 'id' and only including visible columns
const visibleColumns = computed(() => {
  return availableColumns.value.filter(col => columnVisibility.value[col]);
});
</script>

<template>
  <div class="flex flex-col min-h-full">
    <!-- Mobile Header with Sheet Trigger -->
    <div v-if="isMobile" class="w-full flex items-center justify-between p-4 border-b">
      <Sheet v-model:open="isMenuOpen">
        <SheetTrigger as-child>
          <Button variant="outline" size="icon">
            <Menu class="h-4 w-4" />
            <span class="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="p-0 w-64">
          <MenuPanel />
        </SheetContent>
      </Sheet>
      <h1 class="text-2xl font-bold flex-1 text-center">Admin Dashboard</h1>
    </div>

    <!-- Desktop Layout with Resizable Panels -->
    <ResizablePanelGroup
      v-else
      direction="horizontal"
      class="flex-1 w-full rounded-lg border"
    >
      <ResizablePanel :default-size="15" :min-size="10" :max-size="25">
        <MenuPanel />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel :default-size="85">
        <div class="flex flex-col h-full p-4">
          <h1 class="text-4xl font-bold mb-6 text-center">Admin Dashboard</h1>
          <p class="text-lg mb-8 text-center">Manage your CSV data below.</p>

          <Tabs default-value="dataTable" class="flex-1 flex flex-col">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="dataTable">Data Table</TabsTrigger>
              <TabsTrigger value="columnSettings">Column Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="dataTable" class="flex-1 flex flex-col mt-4">
              <div v-if="isLoading" class="text-xl text-gray-600 dark:text-gray-300 text-center">Loading data...</div>
              <div v-else-if="error" class="text-xl text-red-600 dark:text-red-400 text-center">Error: {{ error }}</div>
              <div v-else-if="csvData.length > 0" class="w-full max-w-4xl mx-auto flex-1">
                <CsvTable :initial-data="csvData" :visible-columns="visibleColumns" />
              </div>
              <div v-else class="text-xl text-gray-600 dark:text-gray-300 text-center">No CSV data available.</div>
            </TabsContent>
            <TabsContent value="columnSettings" class="flex-1 flex flex-col mt-4">
              <ColumnSettings
                :available-columns="availableColumns"
                :initial-visibility="columnVisibility"
                @update:visibility="updateColumnVisibility"
              />
            </TabsContent>
          </Tabs>

          <RouterLink to="/" class="mt-8 mx-auto">
            <Button variant="outline">Back to Home</Button>
          </RouterLink>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</template>

<style scoped>
/* No specific styles needed here, Tailwind handles it */
</style>