<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import CsvTable from '@/components/CsvTable.vue';
import DecimalQuantityDialog from './DecimalQuantityDialog.vue';
import { showSuccessToast, showInfoToast } from '@/lib/toast';
import type { CsvRow, CartItem } from '@/types';
import { Trash2, Calculator } from 'lucide-vue-next';

interface Props {
  open: boolean;
  initialOrderData: CsvRow[];
}

const props = defineProps<Props>();
const emit = defineEmits(['update:open', 'order-placed']);

const localOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
});

const currentOrderItems = ref<CsvRow[]>([]);
const cartItems = ref<CartItem[]>([]);
const activeTab = ref('select-items');

// State for DecimalQuantityDialog
const isDecimalQuantityDialogOpen = ref(false);
const itemToEditQuantity = ref<CartItem | null>(null);

watch(
  () => props.initialOrderData,
  (newVal) => {
    currentOrderItems.value = JSON.parse(JSON.stringify(newVal));
    cartItems.value = [];
    activeTab.value = 'select-items';
  },
  { immediate: true }
);

const handleItemAddedToCart = (item: CsvRow) => {
  const existingItem = cartItems.value.find(cartItem => cartItem.NAME === item.NAME);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.value.push({ ...item, quantity: 1 });
  }
  showSuccessToast(`${item.NAME} added to cart!`);
};

const handleItemRemovedFromCart = (item: CsvRow) => {
  const index = cartItems.value.findIndex(cartItem => cartItem.NAME === item.NAME);
  if (index !== -1) {
    cartItems.value.splice(index, 1);
    showInfoToast(`${item.NAME} removed from cart.`);
  }
};

const updateCartItemQuantity = (name: string, newQuantity: number) => {
  const item = cartItems.value.find(cartItem => cartItem.NAME === name);
  if (item) {
    if (newQuantity <= 0) {
      handleRemoveCartItem(name);
    } else {
      item.quantity = newQuantity;
      showInfoToast(`Quantity for ${item.NAME} updated.`);
    }
  }
};

const handleRemoveCartItem = (name: string) => {
  cartItems.value = cartItems.value.filter(item => item.NAME !== name);
  showInfoToast('Item removed from cart.');
};

const openDecimalQuantityDialog = (item: CartItem) => {
  itemToEditQuantity.value = item;
  isDecimalQuantityDialogOpen.value = true;
};

const handleDecimalQuantityConfirm = (quantity: number) => {
  if (itemToEditQuantity.value) {
    updateCartItemQuantity(itemToEditQuantity.value.NAME, quantity);
  }
  itemToEditQuantity.value = null;
  isDecimalQuantityDialogOpen.value = false;
};

const handleConfirmItemQuantity = (item: CartItem) => {
  showSuccessToast(`Quantity for ${item.NAME} confirmed.`);
};

const handlePlaceOrder = () => {
  if (cartItems.value.length === 0) {
    showInfoToast('Your cart is empty. Please add items before placing an order.');
    return;
  }
  console.log('Order Placed:', cartItems.value);
  showSuccessToast('Order placed successfully!');
  emit('order-placed', cartItems.value);
  localOpen.value = false;
};
</script>

<template>
  <Sheet v-model:open="localOpen">
    <SheetContent side="right" class="w-full sm:max-w-xl flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Create New Order</SheetTitle>
        <SheetDescription>
          Select items from the table to add to your order.
        </SheetDescription>
      </SheetHeader>

      <Tabs v-model="activeTab" class="flex-1 flex flex-col">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="select-items">Select Items</TabsTrigger>
          <TabsTrigger value="cart">Cart ({{ cartItems.length }})</TabsTrigger>
          <TabsTrigger value="order">Place Order</TabsTrigger>
        </TabsList>
        <TabsContent value="select-items" class="flex-1 flex flex-col mt-4 overflow-y-auto">
          <div>
            <CsvTable
              :initial-data="currentOrderItems"
              :is-order-mode="true"
              :cart-items="cartItems"
              @item-added-to-cart="handleItemAddedToCart"
              @item-removed-from-cart="handleItemRemovedFromCart"
            />
          </div>
        </TabsContent>
        <TabsContent value="cart" class="flex-1 flex flex-col mt-4 overflow-y-auto">
          <div v-if="cartItems.length === 0" class="text-center text-muted-foreground py-8">
            Your cart is empty. Add items from the "Select Items" tab.
          </div>
          <div v-else>
            <div class="space-y-4">
              <div
                v-for="item in cartItems"
                :key="item.NAME"
                class="flex items-center justify-between p-3 border rounded-md bg-card"
              >
                <div class="flex items-center space-x-3 flex-1">
                  <Checkbox :checked="true" disabled />
                  <span class="font-medium">{{ item.NAME }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    @click="updateCartItemQuantity(item.NAME, item.quantity - 1)"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    v-model.number="item.quantity"
                    @change="updateCartItemQuantity(item.NAME, item.quantity)"
                    min="0"
                    step="0.01"
                    class="w-20 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    @click="updateCartItemQuantity(item.NAME, item.quantity + 1)"
                  >
                    +
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    @click="openDecimalQuantityDialog(item)"
                  >
                    <Calculator class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    class="h-8"
                    @click="handleConfirmItemQuantity(item)"
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    class="h-8 w-8"
                    @click="handleRemoveCartItem(item.NAME)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="order" class="flex-1 flex flex-col items-center justify-center mt-4 overflow-y-auto">
          <div v-if="cartItems.length === 0" class="text-center text-muted-foreground py-8">
            Your cart is empty. Please add items to place an order.
          </div>
          <div v-else class="text-center space-y-4">
            <p class="text-lg">Review your order:</p>
            <ul class="list-disc list-inside text-left mx-auto max-w-xs">
              <li v-for="item in cartItems" :key="item.NAME">
                {{ item.NAME }} (x{{ item.quantity }})
              </li>
            </ul>
            <Button @click="handlePlaceOrder" class="mt-6">Place Order</Button>
          </div>
        </TabsContent>
      </Tabs>

      <SheetFooter class="mt-4">
        <Button variant="outline" @click="localOpen = false">Close</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>

  <DecimalQuantityDialog
    v-model:open="isDecimalQuantityDialogOpen"
    :initial-quantity="itemToEditQuantity?.quantity || 0"
    :item-name="itemToEditQuantity?.NAME || 'Item'"
    @confirm="handleDecimalQuantityConfirm"
  />
</template>