<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '@/components/ui/tags-input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff } from 'lucide-vue-next';

const props = defineProps<{
  availableColumns: string[];
  initialVisibility: Record<string, boolean>;
}>();

const emit = defineEmits(['update:visibility']);

const localColumnVisibility = ref<Record<string, boolean>>({});

watch(
  () => props.initialVisibility,
  (newVal) => {
    localColumnVisibility.value = { ...newVal };
  },
  { immediate: true }
);

const toggleColumnVisibility = (column: string) => {
  localColumnVisibility.value[column] = !localColumnVisibility.value[column];
  emit('update:visibility', localColumnVisibility.value);
};

// Demo for TagsInput
const tags = ref<string[]>(['apple', 'banana']);
const newTag = ref('');

const addTag = () => {
  if (newTag.value && !tags.value.includes(newTag.value)) {
    tags.value.push(newTag.value);
    newTag.value = '';
  }
};

const removeTag = (tagToRemove: string) => {
  tags.value = tags.value.filter(tag => tag !== tagToRemove);
};

// Demo for ToggleGroup
const alignment = ref<string[]>(['left']);
</script>

<template>
  <div class="p-4 space-y-6">
    <h2 class="text-2xl font-semibold mb-4">Column Visibility</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div v-for="column in availableColumns" :key="column" class="flex items-center space-x-2">
        <Checkbox
          :id="`col-${column}`"
          :checked="localColumnVisibility[column]"
          @update:checked="toggleColumnVisibility(column)"
        />
        <Label :for="`col-${column}`" class="capitalize">
          {{ column.replace(/_/g, ' ') }}
        </Label>
      </div>
    </div>

    <Separator />

    <h2 class="text-2xl font-semibold mb-4">Tags Input Demo</h2>
    <p class="text-sm text-muted-foreground mb-2">Use this to add multiple tags (e.g., for filtering).</p>
    <TagsInput v-model="tags" class="w-full">
      <div class="flex flex-wrap gap-2">
        <TagsInputItem v-for="tag in tags" :key="tag" :value="tag">
          <TagsInputItemText>{{ tag }}</TagsInputItemText>
          <TagsInputItemDelete @click="removeTag(tag)" />
        </TagsInputItem>
      </div>
      <TagsInputInput placeholder="Add tag..." v-model="newTag" @keydown.enter.prevent="addTag" />
    </TagsInput>

    <Separator />

    <h2 class="text-2xl font-semibold mb-4">Toggle Group Demo</h2>
    <p class="text-sm text-muted-foreground mb-2">Use this for grouping related toggles (e.g., display modes).</p>
    <ToggleGroup v-model="alignment" type="multiple" variant="outline">
      <ToggleGroupItem value="left" aria-label="Toggle left">
        <Eye class="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Toggle center">
        <EyeOff class="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
</template>