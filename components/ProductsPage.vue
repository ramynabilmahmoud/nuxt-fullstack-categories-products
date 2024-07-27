<template>
  <link
    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <div>
    <h2>Product Management</h2>
    <!-- Fetch and Display Products -->
    <div class="card mb-4">
      <div class="card-header">
        <h2 class="card-title">Products List</h2>
      </div>
      <div class="card-body">
        <button @click="fetchProducts" class="btn btn-info mb-3">
          Refresh Products
        </button>
        <div v-if="fetchError" class="alert alert-danger">
          {{ fetchError }}
        </div>
        <div
          v-if="products.length === 0 && !fetchError"
          class="alert alert-warning"
        >
          No products available.
        </div>
        <div v-else>
          <ul class="list-group">
            <li
              v-for="product in products"
              :key="product.id"
              class="list-group-item d-flex align-items-center mb-3"
            >
              <img
                v-if="product.picture"
                :src="product.picture"
                alt="Product Image"
                class="img-thumbnail me-4"
                style="width: 100px; height: 100px; object-fit: cover"
              />
              <div class="ml-4">
                <h5 class="mb-1">{{ product.name }}</h5>
                <p class="mb-1">ID: {{ product.id }}</p>
                <p class="mb-1">Category ID: {{ product.category_id }}</p>
              </div>
              <button
                @click="editProduct(product)"
                class="btn btn-secondary ms-auto ml-4"
              >
                Edit
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Create Product Form -->
    <div class="card mb-4">
      <div class="card-header">
        <h2 class="card-title">Create Product</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="createProduct">
          <div class="mb-3">
            <label for="name" class="form-label">Product Name:</label>
            <input
              v-model="newProduct.name"
              id="name"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label for="picture" class="form-label">Product Picture:</label>
            <input
              @change="handleFileUpload($event, 'create')"
              type="file"
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label for="category_id" class="form-label">Category ID:</label>
            <input
              v-model.number="newProduct.category_id"
              id="category_id"
              type="number"
              class="form-control"
              required
            />
          </div>
          <button type="submit" class="btn btn-primary">Create Product</button>
        </form>
        <div v-if="createError" class="alert alert-danger mt-3">
          {{ createError }}
        </div>
        <div v-if="createSuccess" class="alert alert-success mt-3">
          {{ createSuccess }}
        </div>
      </div>
    </div>

    <!-- Update Product Form -->
    <div id="updateForm" class="card mb-4">
      <div class="card-header">
        <h2 class="card-title">Update Product</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="updateProduct">
          <div class="mb-3">
            <label for="update_id" class="form-label">Product ID:</label>
            <input
              v-model.number="updateProductId"
              id="update_id"
              type="number"
              class="form-control"
              readonly
            />
          </div>
          <div class="mb-3">
            <label for="update_name" class="form-label"
              >New Product Name:</label
            >
            <input
              v-model="updateProductData.name"
              id="update_name"
              type="text"
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label for="update_picture" class="form-label">New Picture:</label>
            <input
              @change="handleFileUpload($event, 'update')"
              type="file"
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label for="update_category_id" class="form-label"
              >New Category ID:</label
            >
            <input
              v-model.number="updateProductData.category_id"
              id="update_category_id"
              type="number"
              class="form-control"
            />
          </div>
          <button type="submit" class="btn btn-warning">Update Product</button>
        </form>
        <div v-if="updateError" class="alert alert-danger mt-3">
          {{ updateError }}
        </div>
        <div v-if="updateSuccess" class="alert alert-success mt-3">
          {{ updateSuccess }}
        </div>
      </div>
    </div>

    <!-- Delete Product Form -->
    <div class="card mb-4">
      <div class="card-header">
        <h2 class="card-title">Delete Product</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="deleteProduct">
          <div class="mb-3">
            <label for="delete_id" class="form-label">Product ID:</label>
            <input
              v-model.number="deleteProductId"
              id="delete_id"
              type="number"
              class="form-control"
              required
            />
          </div>
          <button type="submit" class="btn btn-danger">Delete Product</button>
        </form>
        <div v-if="deleteError" class="alert alert-danger mt-3">
          {{ deleteError }}
        </div>
        <div v-if="deleteSuccess" class="alert alert-success mt-3">
          {{ deleteSuccess }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const newProduct = ref({
  name: "",
  picture: "",
  category_id: null,
});

const updateProductId = ref(null);
const updateProductData = ref({
  name: "",
  picture: "",
  category_id: null,
});

const deleteProductId = ref(null);

const products = ref([]);
const createError = ref(null);
const createSuccess = ref(null);
const updateError = ref(null);
const updateSuccess = ref(null);
const deleteError = ref(null);
const deleteSuccess = ref(null);
const fetchError = ref(null);

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleFileUpload = async (event, type) => {
  const file = event.target.files[0];
  if (file) {
    const base64 = await convertToBase64(file);
    if (type === "create") {
      newProduct.value.picture = base64;
    } else if (type === "update") {
      updateProductData.value.picture = base64;
    }
  }
};

const createProduct = async () => {
  try {
    const response = await $fetch("/api/products", {
      method: "POST",
      body: newProduct.value,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    createSuccess.value = "Product created successfully!";
    createError.value = null;
    newProduct.value = {
      name: "",
      picture: "",
      category_id: null,
    }; // Reset form
    fetchProducts(); // Refresh product list
  } catch (err) {
    createError.value = "Failed to create product: " + err.message;
    createSuccess.value = null;
  }
};

const updateProduct = async () => {
  try {
    const response = await $fetch(`/api/products?id=${updateProductId.value}`, {
      method: "PUT",
      body: updateProductData.value,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    updateSuccess.value = "Product updated successfully!";
    updateError.value = null;
    fetchProducts(); // Refresh product list
  } catch (err) {
    updateError.value = "Failed to update product: " + err.message;
    updateSuccess.value = null;
  }
};

const deleteProduct = async () => {
  try {
    const response = await $fetch(`/api/products?id=${deleteProductId.value}`, {
      method: "DELETE",
    });

    if (response.error) {
      throw new Error(response.error);
    }

    deleteSuccess.value = "Product deleted successfully!";
    deleteError.value = null;
    fetchProducts(); // Refresh product list
  } catch (err) {
    deleteError.value = "Failed to delete product: " + err.message;
    deleteSuccess.value = null;
  }
};

const fetchProducts = async () => {
  try {
    const response = await $fetch("/api/products");

    if (response.error) {
      throw new Error(response.error);
    }

    products.value = response;
    fetchError.value = null;
  } catch (err) {
    fetchError.value = "Failed to fetch products: " + err.message;
  }
};

const editProduct = (product) => {
  updateProductId.value = product.id;
  updateProductData.value = {
    name: product.name,
    picture: product.picture,
    category_id: product.category_id,
  };
  const updateForm = document.getElementById("updateForm");
  if (updateForm) {
    updateForm.scrollIntoView();
  }
};

fetchProducts();
</script>

<style scoped>
/* Your existing styles here */
</style>
