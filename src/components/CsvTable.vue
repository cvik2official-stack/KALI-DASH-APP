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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Pencil, Calculator } from 'lucide-vue-next';
import AddEditCsvRowDialog from './AddEditCsvRowDialog.vue';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast';
import Papa from 'papaparse';
import type { CsvRow, CartItem } from '@/types';

const props = defineProps<{
  initialData: CsvRow[];
  viewMode: 'default' | 'select-items' | 'cart'; // New prop for different views
  cartItems: CartItem[]; // Required for 'select-items' and 'cart' modes
}>();

const emit = defineEmits([
  'item-added-to-cart',
  'item-removed-from-cart',
  'update-cart-item-quantity',
  'open-decimal-quantity-dialog',
  'save',
]);

const columnHelper = createColumnHelper<CsvRow>();

const internalTableData = ref<CsvRow[]>([]);
const isAddEditDialogOpen = ref(false);
const addEditDialogMode = ref<'add' | 'edit'>('add');
const currentEditRow = ref<CsvRow | undefined>(undefined);

const columnVisibility = ref<Record<string, boolean>>({
  select: false,
});

watch(
  () => props.initialData,
  (newVal) => {
    internalTableData.value = newVal.map((row, index) => ({
      ...row,
      id: row.id || String(index + 1),
    }));
  },
  { immediate: true }
);

// Filtered data for 'cart' view mode
const filteredCartData = computed(() => {
  if (props.viewMode === 'cart') {
    const cartItemIds = new Set(props.cartItems.map(item => item.id));
    return internalTableData.value.filter(row => cartItemIds.has(row.id));
  }
  return internalTableData.value;
});

const columns = computed<ColumnDef<CsvRow, any>[]>(() => {
  if (internalTableData.value.length === 0 && props.viewMode !== 'cart') return [];
  if (props.viewMode === 'cart' && filteredCartData.value.length === 0) return [];

  const dataToUseForColumns = props.viewMode === 'cart' ? filteredCartData.value : internalTableData.value;
  if (dataToUseForColumns.length === 0) return []; // Handle case where filtered data is empty

  const firstRowKeys = Object.keys(dataToUseForColumns[0]).filter(key => key !== 'id');

  const dynamicColumns = firstRowKeys
    .filter(key => {
      // Hide 'default_supplier' in 'select-items' and 'cart' modes
      if (key === 'default_supplier' && (props.viewMode === 'select-items' || props.viewMode === 'cart')) {
        return false;
      }
      return true;
    })
    .map(key =>
      columnHelper.accessor(key, {
        header: () => key.replace(/_/g, ' ').toUpperCase(),
        cell: info => h('div', { class: 'text-left' }, info.getValue()),
        enableHiding: true,
      })
    );

  const generatedColumns: ColumnDef<CsvRow, any>[] = [];

  if (props.viewMode === 'select-items') {
    generatedColumns.push(
      columnHelper.display({
        id: 'select',
        header: () => h('div', { class: 'text-center' }, 'Select'),
        cell: ({ row }) => {
          const isSelected = props.cartItems.some(item => item.id === row.original.id);
          return h(Checkbox, {
            checked: isSelected,
            class: 'form-checkbox h-4 w-4 text-primary rounded',
            onUpdate: (checked: boolean) => {
              if (checked) {
                emit('item-added-to-cart', row.original);
              } else {
                emit('item-removed-from-cart', row.original);
              }
            },
          });
        },
        enableHiding: false,
      })
    );
  } else if (props.viewMode === 'cart') {
    generatedColumns.push(
      columnHelper.display({
        id: 'select',
        header: () => h('div', { class: 'text-center' }, 'Selected'),
        cell: ({ row }) => {
          return h(Checkbox, {
            checked: true, // Always ticked in cart view
            class: 'form-checkbox h-4 w-4 text-primary rounded',
            onUpdate: (checked: boolean) => {
              if (!checked) {
                emit('item-removed-from-cart', row.original.id);
              }
            },
          });
        },
        enableHiding: false,
      })
    );
  }

  generatedColumns.push(...dynamicColumns);

  if (props.viewMode === 'cart') {
    generatedColumns.push(
      columnHelper.display({
        id: 'quantity-controls',
        header: () => 'Quantity',
        cell: ({ row }) => {
          const item = props.cartItems.find(cartItem => cartItem.id === row.original.id);
          const currentQuantity = item ? item.quantity : 0;

          return h('div', { class: 'flex items-center space-x-2' }, [
            h(
              Button,
              {
                variant: 'outline',
                size: 'icon',
                class: 'h-8 w-8',
                onClick: () => emit('update-cart-item-quantity', row.original.id, currentQuantity - 1),
              },
              () => '-'
            ),
            h(Input, {
              type: 'number',
              modelValue: currentQuantity,
              'onUpdate:modelValue': (value: string | number) => {
                const newQuantity = parseFloat(String(value));
                if (!isNaN(newQuantity)) {
                  emit('update-cart-item-quantity', row.original.id, newQuantity);
                }
              },
              min: '0',
              step: '0.01',
              class: 'w-20 text-center',
            }),
            h(
              Button,
              {
                variant: 'outline',
                size: 'icon',
                class: 'h-8 w-8',
                onClick: () => emit('update-cart-item-quantity', row.original.id, currentQuantity + 1),
              },
              () => '+'
            ),
            h(
              Button,
              {
                variant: 'outline',
                size: 'icon',
                class: 'h-8 w-8',
                onClick: () => emit('open-decimal-quantity-dialog', item),
              },
              () => h(Calculator, { class: 'h-4 w-4' })
            ),
            h(
              Button,
              {
                variant: 'secondary',
                size: 'sm',
                class: 'h-8',
                onClick: () => { /* No specific action needed here, quantity is reactive */ },
              },
              () => 'Confirm'
            ),
          ]);
        },
        enableHiding: false,
      })
    );
  } else if (props.viewMode === 'default') {
    generatedColumns.push(
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
        enableHiding: false,
      })
    );
  }

  return generatedColumns;
});

const table = useVueTable({
  get data() {
    return filteredCartData.value; // Use filtered data for the table
  },
  get columns() {
    return columns.value;
  },
  getCoreRowModel: getCoreRowModel(),
  state: {
    columnVisibility,
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

const handleDelete = (id: string) => {
  internalTableData.value = internalTableData.value.filter(row => row.id !== id);
  showSuccessToast('Row deleted successfully!');
};

const handleSaveRow = (newRowData: Record<string, string>) => {
  if (addEditDialogMode.value === 'add') {
    const newId = String(internalTableData.value.length > 0 ? Math.max(...internalTableData.value.map(r => Number(r.id))) + 1 : 1);
    internalTableData.value.push({ ...newRowData, id: newId });
    showSuccessToast('Row added successfully!');
  } else if (addEditDialogMode.value === 'edit' && currentEditRow.value) {
    const index = internalTableData.value.findIndex(row => row.id === currentEditRow.value?.id);
    if (index !== -1) {
      internalTableData.value[index] = { ...newRowData, id: currentEditRow.value.id };
      showSuccessToast('Row updated successfully!');
    } else {
      showErrorToast('Failed to update row.');
    }
  }
};

const handleExportCsv = () => {
  if (internalTableData.value.length === 0) {
    showInfoToast('No data to export.');
    return;
  }
  const csv = Papa.unparse(internalTableData.value);
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
    <div class="flex justify-between mb-4" v-if="viewMode === 'default'">
      <Button @click="handleAddRow">Add New Row</Button>
      <div class="flex space-x-2">
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
      v-if="viewMode === 'default'"
      v-model:open="isAddEditDialogOpen"
      :mode="addEditDialogMode"
      :initial-data="currentEditRow"
      :columns="Object.keys(internalTableData[0] || {}).filter(key => key !== 'id')"
      @save="handleSaveRow"
    />
  </div>
</template>