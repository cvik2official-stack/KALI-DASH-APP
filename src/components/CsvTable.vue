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
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast';
import Papa from 'papaparse';

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

// Reactive state for column visibility (still needed for internal table logic, but not exposed via button)
const columnVisibility = ref<Record<string, boolean>>({
  select: false, // Hide checkbox column by default
});

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
      cell: info => h('div', { class: 'text-left' }, info.getValue()), // Default left alignment
      enableHiding: true, // Ensure dynamic columns can be hidden
    })
  );

  return [
    // Removed the 'select' column as it's not needed without the view columns button
    ...dynamicColumns,
    columnHelper.display({
      id: 'actions',
      header: () => 'Actions',
      cell: ({ row }) => {
        const originalRow = row.original;
        return h('div', { class: 'flex space-x-2' }, [
          h(
            Button,
            {
              variant: 'outline',
              size: 'icon',
              class: 'h-8 w-8 p-0',
              onClick: () => handleEdit(originalRow),
            },
            () => h(Pencil, { class: 'h-4 w-4' })
          ),
          h(
            Button,
            {
              variant: 'destructive',
              size: 'icon',
              class: 'h-8 w-8 p-0',
              onClick: () => handleDelete(originalRow.id),
            },
            () => h(Trash2, { class: 'h-4 w-4' })
          ),
        ]);
      },
      enableHiding: false, // Actions column should generally not be hidden
    }),
  ];
});

const table = useVueTable({
  get data() {
    return tableData.value;
  },
  get columns() {
    return columns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  state: {
    columnVisibility, // Pass the reactive ref for column visibility
  },
  onColumnVisibilityChange: updater => {
    // Update the reactive ref when the table's internal state changes
    columnVisibility.value =
      typeof updater === 'function' ? updater(columnVisibility.value) : updater;
  },
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

const handleExportCsv = () => {
  if (tableData.value.length === 0) {
    showInfoToast('No data to export.');
    return;
  }
  const csv = Papa.unparse(tableData.value);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'exported_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showSuccessToast('Data exported successfully!');
};
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between mb-4">
      <Button @click="handleAddRow">Add New Row</Button>
      <div class="flex space-x-2">
        <!-- Removed DropdownMenu for View Columns -->
        <Button variant="outline" @click="handleExportCsv">Export CSV</Button>
      </div>
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