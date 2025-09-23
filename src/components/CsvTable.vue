<script setup lang="ts">
import { ref, computed, watch, h } from 'vue';
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/vue-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil } from 'lucide-vue-next';
import AddEditCsvRowDialog from './AddEditCsvRowDialog.vue';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

interface CsvRow {
  [key: string]: string;
  id: string; // Add an ID for unique identification
}

const props = defineProps<{
  initialData: CsvRow[];
}>();

const columnHelper = createColumnHelper<CsvRow>();

const tableData = ref<CsvRow[]>([]);
const isAddEditDialogOpen = ref(false);
const addEditDialogMode = ref<'add' | 'edit'>('add');
const currentEditRow = ref<CsvRow | undefined>(undefined);

// Watch for changes in initialData and update tableData reactively
watch(
  () => props.initialData,
  (newVal) => {
    tableData.value = newVal.map((row, index) => ({
      ...row,
      id: row.id || String(index + 1), // Use existing ID or generate one
    }));
  },
  { immediate: true } // Run immediately on component mount
);

const columns = computed<ColumnDef<CsvRow, any>[]>(() => {
  if (tableData.value.length === 0) return [];

  const firstRowKeys = Object.keys(tableData.value[0]).filter(key => key !== 'id'); // Exclude 'id' from display columns

  const dynamicColumns = firstRowKeys.map(key =>
    columnHelper.accessor(key, {
      header: () => key.replace(/_/g, ' ').toUpperCase(),
      cell: info => info.getValue(),
    })
  );

  return [
    ...dynamicColumns,
    columnHelper.display({
      id: 'actions',
      header: () => 'Actions',
      cell: ({ row }) => {
        const originalRow = row.original;
        return h('div', { class: 'flex space-x-2' }, [
          h(Button, {
            variant: 'outline',
            size: 'sm',
            onClick: () => handleEdit(originalRow),
          }, () => h(Pencil, { class: 'h-4 w-4' })),
          h(Button, {
            variant: 'destructive',
            size: 'sm',
            onClick: () => handleDelete(originalRow.id),
          }, () => h(Trash2, { class: 'h-4 w-4' })),
        ]);
      },
    }),
  ];
});

const table = useVueTable({
  get data() {
    return tableData.value;
  },
  get columns() { // Ensure columns are reactively provided as a getter
    return columns.value;
  },
  getCoreRowModel: getCoreRowModel(),
});

const handleAddRow = () => {
  addEditDialogMode.value = 'add';
  currentEditRow.value = undefined;
  isAddEditDialogOpen.value = true;
};

const handleEdit = (row: CsvRow) => {
  addEditDialogMode.value = 'edit';
  currentEditRow.value = row;
  isAddEditDialogOpen.value = true;
};

const handleDelete = (id: string) => {
  tableData.value = tableData.value.filter(row => row.id !== id);
  showSuccessToast('Row deleted successfully!');
};

const handleSaveRow = (newRowData: Record<string, string>) => {
  if (addEditDialogMode.value === 'add') {
    const newId = String(tableData.value.length > 0 ? Math.max(...tableData.value.map(r => Number(r.id))) + 1 : 1);
    tableData.value.push({ ...newRowData, id: newId });
    showSuccessToast('Row added successfully!');
  } else if (addEditDialogMode.value === 'edit' && currentEditRow.value) {
    const index = tableData.value.findIndex(row => row.id === currentEditRow.value?.id);
    if (index !== -1) {
      tableData.value[index] = { ...newRowData, id: currentEditRow.value.id };
      showSuccessToast('Row updated successfully!');
    } else {
      showErrorToast('Failed to update row.');
    }
  }
};
</script>

<template>
  <div class="w-full">
    <div class="flex justify-end mb-4">
      <Button @click="handleAddRow">Add New Row</Button>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <AddEditCsvRowDialog
      v-model:open="isAddEditDialogOpen"
      :mode="addEditDialogMode"
      :initial-data="currentEditRow"
      :columns="Object.keys(tableData[0] || {}).filter(key => key !== 'id')"
      @save="handleSaveRow"
    />
  </div>
</template>