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
import CsvTable from '@/components/CsvTable.vue';
import { showSuccessToast, showInfoToast } from '@/lib/toast';
import type { CsvRow, CartItem } from '@/types';
import { Trash2 } from 'lucide-vue-next';

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

watch(
  () => props.initialOrderData,
  (newVal) => {
    // Ensure we're working with a fresh copy for the order session
    currentOrderItems.value = JSON.parse(JSON.stringify(newVal));
    cartItems.value = []; // Reset cart when new order session starts
    activeTab.value = 'select-items'; // Go back to select items tab
  },
  { immediate: true }
);

const handleItemAddedToCart = (item: CsvRow) => {
  const existingItem = cartItems.value.find(cartItem => cartItem.id === item.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cartItems.value.push({ ...item, quantity: 1 });
  }
  showSuccessToast(`${item.name || item.id} added to cart!`);
};

const handleItemRemovedFromCart = (item: CsvRow) => {
  const index = cartItems.value.findIndex(cartItem => cartItem.id === item.id);
  if (index !== -1) {
    cartItems.value.splice(index, 1);
    showInfoToast(`${item.name || item.id} removed from cart.`);
  }
};

const updateCartItemQuantity = (id: string, newQuantity: number) => {
  const item = cartItems.value.find(cartItem => cartItem.id === id);
  if (item) {
    if (newQuantity <= 0) {
      handleRemoveCartItem(id);
    } else {
      item.quantity = newQuantity;
    }
  }
};

const handleRemoveCartItem = (id: string) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id);
  showInfoToast('Item removed from cart.');
};

const totalCartValue = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = parseFloat(item.price as string); // Assuming price is a string in CsvRow
    return sum + (isNaN(price) ? 0 : price * item.quantity);
  }, 0).toFixed(2);
});

const handlePlaceOrder = () => {
  if (cartItems.value.length === 0) {
    showInfoToast('Your cart is empty. Please add items before placing an order.');
    return;
  }
  // In a real application, you would send `cartItems.value` to a backend here.
  console.log('Order Placed:', cartItems.value);
  showSuccessToast('Order placed successfully!');
  emit('order-placed', cartItems.value);
  localOpen.value = false; // Close the sheet after placing order
};
</script>

<template>
  <Sheet v-model:open="localOpen">
    <SheetContent side="right" class="w-full sm:max-w-xl flex flex-col">
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
        <TabsContent value="select-items" class="flex-1 flex flex-col mt-4">
          <div class="flex-1 overflow-auto">
            <CsvTable
              :initial-data="currentOrderItems"
              :is-order-mode="true"
              :cart-items="cartItems"
              @item-added-to-cart="handleItemAddedToCart"
              @item-removed-from-cart="handleItemRemovedFromCart"
            />
          </div>
        </TabsContent>
        <TabsContent value="cart" class="flex-1 flex flex-col mt-4">
          <div v-if="cartItems.length === 0" class="text-center text-muted-foreground py-8">
            Your cart is empty. Add items from the "Select Items" tab.
          </div>
          <div v-else class="flex-1 overflow-auto">
            <div class="space-y-4">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="flex items-center justify-between p-3 border rounded-md bg-card"
              >
                <div class="flex-1">
                  <p class="font-medium">{{ item.name || item.id }}</p>
                  <p class="text-sm text-muted-foreground">Price: ${{ parseFloat(item.price as string).toFixed(2) }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    @click="updateCartItemQuantity(item.id, item.quantity - 1)"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    v-model.number="item.quantity"
                    @change="updateCartItemQuantity(item.id, item.quantity)"
                    min="1"
                    class="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    class="h-8 w-8"
                    @click="updateCartItemQuantity(item.id, item.quantity + 1)"
                  >
                    +
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    class="h-8 w-8"
                    @click="handleRemoveCartItem(item.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div class="mt-6 p-4 border-t flex justify-between items-center font-bold text-lg">
              <span>Total:</span>
              <span>${{ totalCartValue }}</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="order" class="flex-1 flex flex-col items-center justify-center mt-4">
          <div v-if="cartItems.length === 0" class="text-center text-muted-foreground py-8">
            Your cart is empty. Please add items to place an order.
          </div>
          <div v-else class="text-center space-y-4">
            <p class="text-lg">Review your order:</p>
            <ul class="list-disc list-inside text-left mx-auto max-w-xs">
              <li v-for="item in cartItems" :key="item.id">
                {{ item.name || item.id }} (x{{ item.quantity }}) - ${{ (parseFloat(item.price as string) * item.quantity).toFixed(2) }}
              </li>
            </ul>
            <p class="text-xl font-bold mt-4">Total: ${{ totalCartValue }}</p>
            <Button @click="handlePlaceOrder" class="mt-6">Place Order</Button>
          </div>
        </TabsContent>
      </Tabs>

      <SheetFooter class="mt-4">
        <Button variant="outline" @click="localOpen = false">Close</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>