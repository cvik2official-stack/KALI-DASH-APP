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
  initialQuantity: number;
  itemName: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:open', 'confirm']);

const localOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const currentInput = ref<string>('0');

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      currentInput.value = String(props.initialQuantity);
    }
  },
  { immediate: true }
);

const appendToInput = (char: string) => {
  if (currentInput.value === '0' && char !== '.') {
    currentInput.value = char;
  } else if (char === '.' && currentInput.value.includes('.')) {
    // Do nothing if decimal already exists
  } else {
    currentInput.value += char;
  }
};

const clearInput = () => {
  currentInput.value = '0';
};

const backspaceInput = () => {
  if (currentInput.value.length > 1) {
    currentInput.value = currentInput.value.slice(0, -1);
  } else {
    currentInput.value = '0';
  }
};

const handleConfirm = () => {
  const quantity = parseFloat(currentInput.value);
  if (!isNaN(quantity) && quantity >= 0) {
    emit('confirm', quantity);
    localOpen.value = false;
  } else {
    // Optionally show an error toast for invalid input
    // showErrorToast('Please enter a valid number.');
  }
};
</script>

<template>
  <Dialog v-model:open="localOpen">
    <DialogContent class="sm:max-w-[380px]">
      <DialogHeader>
        <DialogTitle>Set Quantity for {{ itemName }}</DialogTitle>
        <DialogDescription>
          Enter the desired quantity, including decimal values.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="flex flex-col items-center gap-2">
          <Label for="quantity-input" class="text-lg font-semibold">Quantity</Label>
          <Input
            id="quantity-input"
            v-model="currentInput"
            type="text"
            inputmode="decimal"
            class="w-full text-center text-2xl h-12"
            readonly
          />
        </div>
        <div class="grid grid-cols-3 gap-2">
          <Button v-for="n in 9" :key="n" variant="outline" class="h-12 text-xl" @click="appendToInput(String(n))">
            {{ n }}
          </Button>
          <Button variant="outline" class="h-12 text-xl" @click="appendToInput('.')">.</Button>
          <Button variant="outline" class="h-12 text-xl" @click="appendToInput('0')">0</Button>
          <Button variant="outline" class="h-12 text-xl" @click="backspaceInput()">←</Button>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="clearInput">Clear</Button>
        <Button @click="handleConfirm">Set Quantity</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>