<script setup lang="ts">
import { ref } from 'vue';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { showInfoToast, showSuccessToast, showErrorToast } from '@/lib/toast';

const pastedData = ref('');

const handleProcessData = () => {
  if (pastedData.value.trim()) {
    // In a real application, you would parse and process this data.
    // For now, we'll just simulate successful processing.
    showSuccessToast('Pasted data processed successfully! (Simulated)');
    console.log('Pasted Data:', pastedData.value);
    pastedData.value = ''; // Clear the textarea after "processing"
  } else {
    showErrorToast('Please paste some data to process.');
  }
};
</script>

<template>
  <div class="p-4 space-y-6">
    <h2 class="text-2xl font-semibold mb-4">Paste Data (CSV or JSON)</h2>
    <p class="text-sm text-muted-foreground mb-4">Paste your CSV or JSON data directly into the text area below.</p>

    <div class="grid w-full gap-1.5">
      <Label for="pasted-data">Data</Label>
      <Textarea
        id="pasted-data"
        v-model="pastedData"
        placeholder="Paste your CSV or JSON data here..."
        rows="10"
      />
    </div>

    <Button @click="handleProcessData" :disabled="!pastedData.trim()">
      Process Data
    </Button>
  </div>
</template>