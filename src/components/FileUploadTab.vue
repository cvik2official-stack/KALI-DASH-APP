<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { showInfoToast, showSuccessToast, showErrorToast } from '@/lib/toast';

const selectedFile = ref<File | null>(null);

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
    showInfoToast(`File selected: ${selectedFile.value.name}`);
  } else {
    selectedFile.value = null;
  }
};

const handleUpload = () => {
  if (selectedFile.value) {
    // In a real application, you would send this file to a server.
    // For now, we'll just simulate a successful upload.
    showSuccessToast(`'${selectedFile.value.name}' uploaded successfully! (Simulated)`);
    selectedFile.value = null; // Clear the selected file after "upload"
  } else {
    showErrorToast('Please select a file to upload.');
  }
};
</script>

<template>
  <div class="p-4 space-y-6">
    <h2 class="text-2xl font-semibold mb-4">Upload Data File</h2>
    <p class="text-sm text-muted-foreground mb-4">Upload a CSV or JSON file to import new data.</p>

    <div class="grid w-full max-w-sm items-center gap-1.5">
      <Label for="data-file">Data File</Label>
      <Input id="data-file" type="file" @change="handleFileChange" accept=".csv,.json" />
    </div>

    <Button @click="handleUpload" :disabled="!selectedFile">
      Upload File
    </Button>

    <div v-if="selectedFile" class="text-sm text-muted-foreground">
      Selected: {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(2) }} KB)
    </div>
  </div>
</template>