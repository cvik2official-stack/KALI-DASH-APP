<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { showInfoToast, showSuccessToast, showErrorToast } from '@/lib/toast';
import axios from 'axios'; // For making HTTP requests

const url = ref('');
const isLoadingFetch = ref(false);

const handleFetchData = async () => {
  if (!url.value.trim()) {
    showErrorToast('Please enter a URL.');
    return;
  }

  isLoadingFetch.value = true;
  showInfoToast('Fetching data from URL...');

  try {
    // In a real application, you might want to proxy this request through a backend
    // to avoid CORS issues and expose API keys. For this client-side example,
    // we'll make a direct request, which might be subject to CORS.
    const response = await axios.get(url.value.trim());
    showSuccessToast('Data fetched successfully! (Simulated)');
    console.log('Fetched Data:', response.data);
    // Here you would typically process the fetched data (e.g., parse CSV/JSON)
    // and update your table or state.
    url.value = ''; // Clear the URL input after successful fetch
  } catch (error: any) {
    console.error('Error fetching data:', error);
    showErrorToast(`Failed to fetch data: ${error.message || 'Unknown error'}`);
  } finally {
    isLoadingFetch.value = false;
  }
};
</script>

<template>
  <div class="p-4 space-y-6">
    <h2 class="text-2xl font-semibold mb-4">Fetch Data from URL</h2>
    <p class="text-sm text-muted-foreground mb-4">Enter a URL to fetch CSV or JSON data directly.</p>

    <div class="grid w-full gap-1.5">
      <Label for="data-url">Data URL</Label>
      <Input
        id="data-url"
        v-model="url"
        placeholder="e.g., https://example.com/data.csv"
        type="url"
      />
    </div>

    <Button @click="handleFetchData" :disabled="!url.trim() || isLoadingFetch">
      <span v-if="isLoadingFetch">Fetching...</span>
      <span v-else>Fetch Data</span>
    </Button>
  </div>
</template>