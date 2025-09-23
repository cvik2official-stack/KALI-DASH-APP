<script setup lang="ts">
import { ref, computed, h } from 'vue';
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
import { Calculator } from 'lucide-vue-next';
import type { CartItem } from '@/types';

const props = defineProps<{
  cartItems: CartItem[];
}>();

const emit = defineEmits([
  'item-removed-from-cart',
  'update-cart-item-quantity',
  'open-decimal-quantity-dialog',
]);

const columnHelper = createColumnHelper<CartItem>();

const columns = computed<ColumnDef<CartItem, any>[]>(() => [
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
  }),
  columnHelper.accessor('name', {
    header: () => 'Item Name',
    cell: info => h('span', { class: 'font-medium' }, info.getValue() || info.row.original.id),
    enableHiding: false,
  }),
  columnHelper.display({
    id: 'quantity-controls',
    header: () => 'Quantity',
    cell: ({ row }) => {
      const item = row.original;
      return h('div', { class: 'flex items-center space-x-2' }, [
        h(
          Button,
          {
            variant: 'outline',
            size: 'icon',
            class: 'h-8 w-8',
            onClick: () => emit('update-cart-item-quantity', item.id, item.quantity - 1),
          },
          () => '-'
        ),
        h(Input, {
          type: 'number',
          modelValue: item.quantity,
          'onUpdate:modelValue': (value: string | number) => {
            const newQuantity = parseFloat(String(value));
            if (!isNaN(newQuantity)) {
              emit('update-cart-item-quantity', item.id, newQuantity);
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
            onClick: () => emit('update-cart-item-quantity', item.id, item.quantity + 1),
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
  }),
]);

const table = useVueTable({
  get data() {
    return props.cartItems;
  },
  get columns() {
    return columns.value;
  },
  getCoreRowModel: getCoreRowModel(),
});
</script>

<template>
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
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No items in cart.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>