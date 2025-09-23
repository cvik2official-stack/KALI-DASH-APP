<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'; // Keep watch for console logging
import { Button } from '@/components/ui/button';
import { loadCsvData } from '@/lib/csvUtils';
import CsvTable from '@/components/CsvTable.vue';
import { showInfoToast, showErrorToast, showSuccessToast } from '@/lib/toast';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-vue-next';
import MenuPanel from '@/components/MenuPanel.vue';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CsvRow, CartItem } from '@/types'; // Import the new types

const csvData = ref<CsvRow[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isMenuOpen = ref(false);
const isOrderMode = ref(false); // New state for order mode
const cartItems = ref<CartItem[]>([]); // New state for cart items

onMounted(async () => {
  showInfoToast('Loading CSV data...');
  try {
    const data = await loadCsvData('/data/grocery-list.csv');
    csvData.value = data.map((row, index) => ({ ...row, id: row.id || String(index + 1) })); // Ensure each row has an ID
    showSuccessToast('CSV data loaded successfully!');
  } catch (e: any) {
    error.value = e.message || 'Failed to load CSV data.';
    showErrorToast(error.value);
  } finally {
    isLoading.value = false;
  }
});

// Watch for changes in isOrderMode for debugging (console log)
watch(isOrderMode, (newVal) => {
  console.log('Order Mode (internal state) changed to:', newVal);
});

// Handlers for cart actions (will be passed to CsvTable)
const handleItemAddedToCart = (item: CsvRow) => {
  const existingItem = cartItems.value.find(cartItem => cartItem.id === item.id);
  if (existingItem) {
    existingItem.quantity++;
    showSuccessToast(`${item.item_name || item.id} quantity increased!`);
  } else {
    cartItems.value.push({ ...item, quantity: 1 });
    showSuccessToast(`${item.item_name || item.id} added to cart!`);
  }
};

const handleItemRemovedFromCart = (item: CsvRow) => {
  cartItems.value = cartItems.value.filter(cartItem => cartItem.id !== item.id);
  showInfoToast(`${item.item_name || item.id} removed from cart.`);
};
</script>

<template>
  <div class="flex flex-col min-h-full p-4">
    <div class="w-full flex items-center justify-between mb-6">
      <Sheet v-model:open="isMenuOpen">
        <SheetTrigger as-child>
          <Button variant="outline" size="icon">
            <Menu class="h-4 w-4" />
            <span class="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="p-0 w-64">
          <MenuPanel />
        </SheetContent>
      </Sheet>

      <div class="flex items-center space-x-2">
        <Label for="order-mode-switch">Order Mode</Label>
        <Switch id="order-mode-switch" v-model:checked="isOrderMode" />
      </div>
    </div>
    
    <!-- Prominent visual indicator for Order Mode state -->
    <p class="text-lg font-bold text-center mb-4 p-2 rounded-md"
       :class="isOrderMode ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
      Order Mode is: {{ isOrderMode ? 'ACTIVE' : 'INACTIVE' }}
    </p>

    <Tabs v-if="isOrderMode" default-value="select-items" class="flex-1 flex flex-col">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="select-items">
          Select Items
        </TabsTrigger>
        <TabsTrigger value="cart">
          Cart ({{ cartItems.length }})
        </TabsTrigger>
        <TabsTrigger value="order">
          Order
        </TabsTrigger>
      </TabsList>
      <TabsContent value="select-items" class="flex-1 flex flex-col mt-4">
        <div v-if="isLoading" class="text-xl text-gray-600 dark:text-gray-300 text-center">Loading data...</div>
        <div v-else-if="error" class="text-xl text-red-600 dark:text-red-400 text-center">Error: {{ error }}</div>
        <div v-else-if="csvData.length > 0" class="w-full max-w-4xl mx-auto flex-1">
          <CsvTable
            :initial-data="csvData"
            :is-order-mode="isOrderMode"
            :cart-items="cartItems"
            @item-added-to-cart="handleItemAddedToCart"
            @item-removed-from-cart="handleItemRemovedFromCart"
          />
        </div>
        <div v-else class="text-xl text-gray-600 dark:text-gray-300 text-center">No CSV data available.</div>
      </TabsContent>
      <TabsContent value="cart" class="flex-1 flex flex-col mt-4">
        <div class="w-full max-w-4xl mx-auto">
          <h3 class="text-xl font-semibold mb-4">Your Cart</h3>
          <p v-if="cartItems.length === 0" class="text-muted-foreground">Your cart is empty.</p>
          <!-- CartTable component will go here -->
        </div>
      </TabsContent>
      <TabsContent value="order" class="flex-1 flex flex-col mt-4">
        <div class="w-full max-w-4xl mx-auto">
          <h3 class="text-xl font-semibold mb-4">Order History</h3>
          <p class="text-muted-foreground">No orders placed yet.</p>
          <!-- Order history table will go here -->
        </div>
      </TabsContent>
    </Tabs>
    <div v-else class="flex-1 flex flex-col mt-4">
      <div v-if="isLoading" class="text-xl text-gray-600 dark:text-gray-300 text-center">Loading data...</div>
      <div v-else-if="error" class="text-xl text-red-600 dark:text-red-400 text-center">Error: {{ error }}</div>
      <div v-else-if="csvData.length > 0" class="w-full max-w-4xl mx-auto flex-1">
        <CsvTable
          :initial-data="csvData"
          :is-order-mode="isOrderMode"
          :cart-items="cartItems"
          @item-added-to-cart="handleItemAddedToCart"
          @item-removed-from-cart="handleItemRemovedFromCart"
        />
      </div>
      <div v-else class="text-xl text-gray-600 dark:text-gray-300 text-center">No CSV data available.</div>
    </div>
  </div>
</template>

<style scoped>
/* No specific styles needed here, Tailwind handles it */
</style>