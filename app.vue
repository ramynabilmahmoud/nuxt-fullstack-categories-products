<template>
  <div class="container mt-5">
    <div class="text-center mb-4">
      <button @click="showPage('categories')" class="btn btn-primary mx-2">
        Show Categories
      </button>
      <button @click="showPage('products')" class="btn btn-primary mx-2">
        Show Products
      </button>
    </div>

    <div v-if="currentPage === 'categories'">
      <CategoriesPage />
    </div>
    <div v-if="currentPage === 'products'">
      <ProductsPage />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CategoriesPage from "./components/CategoriesPage.vue";
import ProductsPage from "./components/ProductsPage.vue";

const currentPage = ref("categories"); // default view

const showPage = (page) => {
  currentPage.value = page;
};
</script>

<style scoped>
.container {
  margin-top: 20px;
}
.btn {
  margin: 5px;
}
</style>
