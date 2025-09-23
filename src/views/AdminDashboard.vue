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
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from '@/components/ui/menubar';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ColumnSettings from '@/components/ColumnSettings.vue';
import FileUploadTab from '@/components/FileUploadTab.vue';
import PasteDataTab from '@/components/PasteDataTab.vue';
import FetchFromUrlTab from '@/components/FetchFromUrlTab.vue'; // Import new component

interface CsvRow {
  [key: string]: string;
}

const csvData = ref<CsvRow[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isMenuOpen = ref(false);

// State for column visibility
const columnVisibility = ref<Record<string, boolean>>({});
const availableColumns = ref<string[]>([]);

onMounted(async () => {
  showInfoToast('Loading CSV data...');
  try {
    const data = await loadCsvData('/data/grocery-list.csv');
    csvData.value = data;
    if (data.length > 0) {
      const initialColumns = Object.keys(data[0]).filter(key => key !== 'id');
      availableColumns.value = initialColumns;
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

const updateColumnVisibility = (newVisibility: Record<string, boolean>) => {
  columnVisibility.value = newVisibility;
};

const visibleColumns = computed(() => {
  return availableColumns.value.filter(col => columnVisibility.value[col]);
});
</script>

<template>
  <div class="flex flex-col min-h-full">
    <header class="w-full flex items-center p-4 border-b">
      <Sheet v-model:open="isMenuOpen">
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="mr-4">
            <Menu class="h-4 w-4" />
            <span class="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="p-0 w-64">
          <MenuPanel />
        </SheetContent>
      </Sheet>

      <Menubar class="flex-1 justify-center border-none">
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New Tab</MenubarItem>
            <MenubarItem>New Window</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
            <MenubarItem>Redo</MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Cut</MenubarItem>
            <MenubarItem>Copy</MenubarItem>
            <MenubarItem>Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Toggle Fullscreen</MenubarItem>
            <MenubarItem>Zoom In</MenubarItem>
            <MenubarItem>Zoom Out</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </header>

    <main class="flex-1 flex flex-col p-4">
      <Tabs default-value="dataTable" class="flex-1 flex flex-col">
        <TabsList class="grid w-full grid-cols-5"> <!-- Adjusted grid-cols to accommodate new tab -->
          <TabsTrigger value="dataTable">Data Table</TabsTrigger>
          <TabsTrigger value="columnSettings">Column Settings</TabsTrigger>
          <TabsTrigger value="fileUpload">File Upload</TabsTrigger>
          <TabsTrigger value="pasteData">Paste Data</TabsTrigger>
          <TabsTrigger value="fetchFromUrl">Fetch from URL</TabsTrigger> <!-- New Tab Trigger -->
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
        <TabsContent value="fileUpload" class="flex-1 flex flex-col mt-4">
          <FileUploadTab />
        </TabsContent>
        <TabsContent value="pasteData" class="flex-1 flex flex-col mt-4">
          <PasteDataTab />
        </TabsContent>
        <TabsContent value="fetchFromUrl" class="flex-1 flex flex-col mt-4"> <!-- New Tab Content -->
          <FetchFromUrlTab />
        </TabsContent>
      </Tabs>

      <RouterLink to="/" class="mt-8 mx-auto">
        <Button variant="outline">Back to Home</Button>
      </RouterLink>
    </main>
  </div>
</template>

<style scoped>
/* No specific styles needed here, Tailwind handles it */
</style>