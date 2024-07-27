<template>
  <link
    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <div class="container mt-5">
    <h1 class="text-primary mb-4">Product Management</h1>

    <!-- Display Categories and Products -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Products by Category</h2>
      </div>
      <div class="card-body">
        <button @click="fetchProductsAndCategories" class="btn btn-info mb-3">
          Refresh Products
        </button>
        <div v-if="fetchError" class="alert alert-danger">
          {{ fetchError }}
        </div>
        <div
          v-if="categories.length === 0 && !fetchError"
          class="alert alert-warning"
        >
          No categories available.
        </div>
        <div v-else>
          <div v-for="category in categories" :key="category.id" class="mb-4">
            <h4>{{ category.name }}</h4>
            <div v-if="category.products.length === 0" class="alert alert-info">
              No products available under this category.
            </div>
            <ul class="list-group">
              <li
                v-for="product in category.products"
                :key="product.id"
                class="list-group-item d-flex align-items-center mb-2"
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
        <form @submit.prevent="handleDeleteProduct">
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

    <!-- Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteConfirmationModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="deleteConfirmationModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">
              Confirm Deletion
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete this product? This action cannot be
            undone.
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="confirmDeleteProduct"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useNuxtApp } from "#app";

const { $nuxt } = useNuxtApp();

const products = ref([]);
const categories = ref([]);
const fetchError = ref("");
const createError = ref("");
const createSuccess = ref("");
const updateError = ref("");
const updateSuccess = ref("");
const deleteError = ref("");
const deleteSuccess = ref("");
const newProduct = ref({
  name: "",
  picture: null,
  category_id: null,
});
const updateProductId = ref(null);
const updateProductData = ref({ name: "", picture: null, category_id: null });
const deleteProductId = ref(null);

const fetchProductsAndCategories = async () => {
  try {
    const response = await $fetch("/api/products");
    if (response.error) throw new Error(response.error);

    // Filter categories to include only those with products
    categories.value = response.filter(
      (category) => category.products.length > 0
    );
    fetchError.value = null;
  } catch (err) {
    fetchError.value =
      "Failed to fetch products and categories: " + err.message;
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
    fetchProductsAndCategories(); // Refresh product list
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
    fetchProductsAndCategories(); // Refresh product list
  } catch (err) {
    updateError.value = "Failed to update product: " + err.message;
    updateSuccess.value = null;
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

const handleDeleteProduct = () => {
  $("#deleteConfirmationModal").modal("show");
};

const confirmDeleteProduct = async () => {
  try {
    await $fetch(`/api/products?id=${deleteProductId.value}`, {
      method: "DELETE",
    });
    deleteSuccess.value = "Category deleted successfully!";
    deleteError.value = null;
    deleteProductId.value = null; // Reset form
    $("#deleteConfirmationModal").modal("hide");
    fetchProductsAndCategories(); // Refresh category list
  } catch (err) {
    deleteError.value =
      "Failed to delete product: " + (err.response?.data?.error || err.message);
    deleteSuccess.value = null;
  }
};

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

// Initial data fetch
onMounted(() => {
  fetchProductsAndCategories();
});
</script>
