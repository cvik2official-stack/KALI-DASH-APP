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

interface Props {
  open: boolean;
  mode: 'add' | 'edit';
  initialData?: Record<string, string>;
  columns: string[];
}

const props = defineProps<Props>();
const emit = defineEmits(['update:open', 'save']);

const localOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const formData = ref<Record<string, string>>({});

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.initialData) {
        formData.value = { ...props.initialData };
      } else {
        // Initialize with empty strings for all columns
        formData.value = props.columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
      }
    }
  },
  { immediate: true }
);

const handleSave = () => {
  emit('save', formData.value);
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