<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <a class="navbar-brand" href="#">Admin Dashboard</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <li class="nav-item">
            <button
              @click="showCategoryManagement"
              :class="[
                'nav-link',
                'btn',
                'btn-primary',
                { active: currentView === 'categories' },
              ]"
            >
              Category Management
            </button>
          </li>
          <li class="nav-item">
            <button
              @click="showProductManagement"
              :class="[
                'nav-link',
                'btn',
                'btn-secondary',
                { active: currentView === 'products' },
              ]"
            >
              Product Management
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Conditionally render components -->
    <div class="container mt-4">
      <CategoryManagement v-if="currentView === 'categories'" />
      <ProductManagement v-if="currentView === 'products'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CategoryManagement from "./components/CategoriesPage.vue";
import ProductManagement from "./components/ProductsPage.vue";

const currentView = ref("categories"); // Default view

const showCategoryManagement = () => {
  currentView.value = "categories";
};

const showProductManagement = () => {
  currentView.value = "products";
};
</script>

<style>
.navbar {
  margin-bottom: 20px;
}

.nav-link {
  cursor: pointer;
  margin-right: 10px;
}

.nav-link.active {
  font-weight: bold;
  border-radius: 4px;
  color: #fff !important;
}

.btn-primary.active {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-secondary.active {
  background-color: #6c757d;
  border-color: #6c757d;
}

.container {
  padding: 20px;
}
</style>
