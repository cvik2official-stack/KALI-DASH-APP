import './global.css';

import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import router from './router'; // Import the router

const app = createApp(App);

app.use(createPinia());
app.use(router); // Use the router

app.mount('#app');