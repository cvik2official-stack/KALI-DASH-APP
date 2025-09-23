<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-vue-next';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const todos = ref<TodoItem[]>([]);
const newTodoText = ref('');
let nextId = 0;

const addTodo = () => {
  if (newTodoText.value.trim()) {
    todos.value.push({ id: nextId++, text: newTodoText.value.trim(), completed: false });
    newTodoText.value = '';
  }
};

const removeTodo = (id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id);
};

const toggleTodoCompletion = (id: number) => {
  const todo = todos.value.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
  }
};
</script>

<template>
  <div class="p-6 max-w-md mx-auto bg-background text-foreground rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">My To-Do List</h2>
    <div class="flex space-x-2 mb-4">
      <Input
        v-model="newTodoText"
        placeholder="Add a new task..."
        @keyup.enter="addTodo"
        class="flex-1"
      />
      <Button @click="addTodo">Add</Button>
    </div>

    <ul class="space-y-3">
      <li
        v-for="todo in todos"
        :key="todo.id"
        class="flex items-center justify-between p-3 bg-card rounded-md shadow-sm"
      >
        <div class="flex items-center space-x-3">
          <Checkbox
            :id="`todo-${todo.id}`"
            :checked="todo.completed"
            @update:checked="toggleTodoCompletion(todo.id)"
          />
          <Label
            :for="`todo-${todo.id}`"
            :class="{ 'line-through text-muted-foreground': todo.completed }"
            class="text-base"
          >
            {{ todo.text }}
          </Label>
        </div>
        <Button variant="destructive" size="icon" class="h-8 w-8" @click="removeTodo(todo.id)">
          <Trash2 class="h-4 w-4" />
        </Button>
      </li>
    </ul>

    <p v-if="todos.length === 0" class="text-center text-muted-foreground mt-4">
      No tasks yet. Add one above!
    </p>
  </div>
</template>