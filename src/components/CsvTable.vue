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
import type { CsvRow, CartItem } from '@/types';

const props = defineProps<{
  initialData: CsvRow[];
  isOrderMode: boolean;
  cartItems: CartItem[];
}>();

const emit = defineEmits(['item-added-to-cart', 'item-removed-from-cart']);

const columnHelper = createColumnHelper<CsvRow>();

const tableData = ref<CsvRow[]>([]);
const isAddEditDialogOpen = ref(false);
const addEditDialogMode = ref<'add' | 'edit'>('add');
const currentEditRow = ref<CsvRow | undefined>(undefined);

const columnVisibility = ref<Record<string, boolean>>({
  select: false,
});

watch(
  () => props.initialData,
  (newVal) => {
    tableData.value = newVal; // Directly assign, NAME is assumed to be present
  },
  { immediate: true }
);

const columns = computed<ColumnDef<CsvRow, any>[]>(() => {
  if (tableData.value.length === 0) return [];

  // Filter out 'id' if it somehow appears, and ensure 'NAME' is always included
  const firstRowKeys = Object.keys(tableData.value[0]).filter(key => key !== 'id');

  const dynamicColumns = firstRowKeys.map(key =>
    columnHelper.accessor(key, {
      header: () => key.replace(/_/g, ' ').toUpperCase(),
      cell: info => h('div', { class: 'text-left' }, info.getValue()),
      enableHiding: true,
    })
  );

  if (props.isOrderMode) {
    const filteredColumns = dynamicColumns.filter(col => {
      // Correctly filter out the 'default_supplier' column
      return !('accessorKey' in col && col.accessorKey === 'default_supplier');
    });

    return [
      columnHelper.display({
        id: 'select',
        header: () => h('div', { class: 'text-center' }, 'Select'),
        cell: ({ row }) => {
          const isSelected = props.cartItems.some(item => item.NAME === row.original.NAME);
          return h('input', {
            type: 'checkbox',
            checked: isSelected,
            value: row.original.NAME, // Add value attribute to uniquely identify the checkbox
            class: 'form-checkbox h-4 w-4 text-primary rounded',
            onChange: (event: Event) => {
              const target = event.target as HTMLInputElement;
              if (target.checked) {
                emit('item-added-to-cart', row.original);
              } else {
                emit('item-removed-from-cart', row.original);
              }
            },
          });
        },
        enableHiding: false,
      }),
      ...filteredColumns,
    ];
  }

  return [
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
              onClick: () => handleDelete(originalRow.NAME),
            },
            () => h(Trash2, { class: 'h-4 w-4' })
          ),
        ]);
      },
      enableHiding: false,
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
    columnVisibility: columnVisibility.value, // Unwrap the ref here
  },
  onColumnVisibilityChange: updater => {
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

const handleDelete = (name: string) => {
  tableData.value = tableData.value.filter(row => row.NAME !== name);
  showSuccessToast('Row deleted successfully!');
};

const handleSaveRow = (newRowData: Record<string, string | number>) => { // Updated type
  if (addEditDialogMode.value === 'add') {
    if (!newRowData.NAME || String(newRowData.NAME).trim() === '') { // Ensure NAME is string for trim
      showErrorToast('Item Name is required to add a new row.');
      return;
    }
    if (tableData.value.some(row => row.NAME === newRowData.NAME)) {
      showErrorToast('An item with this name already exists.');
      return;
    }
    tableData.value.push({ ...newRowData, NAME: String(newRowData.NAME) }); // Ensure NAME is string
    showSuccessToast('Row added successfully!');
  } else if (addEditDialogMode.value === 'edit' && currentEditRow.value) {
    const index = tableData.value.findIndex(row => row.NAME === currentEditRow.value?.NAME);
    if (index !== -1) {
      if (String(newRowData.NAME) !== currentEditRow.value.NAME && tableData.value.some((row, i) => i !== index && row.NAME === newRowData.NAME)) {
        showErrorToast('An item with this name already exists.');
        return;
      }
      tableData.value[index] = { ...newRowData, NAME: String(newRowData.NAME) }; // Ensure NAME is string
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
      <Button v-if="!isOrderMode" @click="handleAddRow">Add New Row</Button>
      <div class="flex space-x-2">
        <Button v-if="!isOrderMode" variant="outline" @click="handleExportCsv">Export CSV</Button>
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
              :key="row.original.NAME"
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