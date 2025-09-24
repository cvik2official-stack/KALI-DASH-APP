<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { showErrorToast } from '@/lib/toast';

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  initialData?: Record<string, string | number>;
  columns: string[];
}

const props = defineProps<Props>();
const emit = defineEmits(['update:open', 'save']);

const localOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const formData = ref<Record<string, string>>({}); // Changed to string for v-model compatibility

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.initialData) {
        // Convert all values to string for input binding
        formData.value = Object.fromEntries(
          Object.entries(props.initialData).map(([key, value]) => [key, String(value)])
        );
      } else {
        formData.value = props.columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
      }
    }
  },
  { immediate: true }
);

const handleSave = () => {
  if (!formData.value.NAME || String(formData.value.NAME).trim() === '') {
    showErrorToast('Item Name cannot be empty.');
    return;
  }
  // Convert back to string | number for saving if necessary, or handle type conversion in parent
  const dataToSave: Record<string, string | number> = {};
  for (const key in formData.value) {
    const value = formData.value[key];
    // Attempt to convert to number if it looks like a number, otherwise keep as string
    dataToSave[key] = isNaN(Number(value)) || value === '' ? value : Number(value);
  }
  emit('save', dataToSave);
  localOpen.value = false;
};
</script>

<template>
  <Dialog v-model:open="localOpen">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ mode === 'add' ? 'Add New Row' : 'Edit Row' }}</DialogTitle>
        <DialogDescription>
          {{ mode === 'add' ? 'Enter the details for the new row.' : 'Edit the details for the selected row.' }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div v-for="column in columns" :key="column" class="grid grid-cols-4 items-center gap-4">
          <Label :for="column" class="text-right capitalize">
            {{ column.replace(/_/g, ' ') }}
          </Label>
          <Input :id="column" v-model="formData[column]" class="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" @click="handleSave">
          {{ mode === 'add' ? 'Add' : 'Save changes' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>