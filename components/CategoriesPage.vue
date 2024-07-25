<template>
  <link
    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
    rel="stylesheet"
  />
  <div class="container mt-5">
    <h1 class="text-primary mb-4">Category Management</h1>

    <!-- Fetch and Display Categories -->
    <div class="card mb-4">
      <div class="card-header">
        <h2 class="card-title">Categories List</h2>
      </div>
      <div class="card-body">
        <button @click="fetchCategories" class="btn btn-info mb-3">
          Refresh Categories
        </button>
        <div v-if="fetchError" class="alert alert-danger">
          {{ fetchError }}
        </div>
        <div v-if="categories.length === 0" class="alert alert-warning">
          No categories available.
        </div>
        <div v-else>
          <ul class="list-group">
            <li
              v-for="category in categories"
              :key="category.id"
              class="list-group-item d-flex align-items-center mb-3"
            >
              <!-- Add image if available -->
              <img
                v-if="category.picture"
                :src="category.picture"
                alt="Category Image"
                class="img-thumbnail me-4"
                style="width: 100px; height: 100px; object-fit: cover"
              />
              <div>
                <h5 class="mb-1">{{ category.name }}</h5>
                <p class="mb-1">ID: {{ category.id }}</p>
                <p class="mb-1">Parent ID: {{ category.parent_id }}</p>
              </div>
              <button
                @click="editCategory(category)"
                class="btn btn-secondary ms-auto ml-4"
              >
                Edit
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Create Category Form -->
    <div class="card mb-4">
      <div class="card-header">
        <h2 class="card-title">Create Category</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="createCategory">
          <div class="mb-3">
            <label for="name" class="form-label">Category Name:</label>
            <input
              v-model="newCategory.name"
              id="name"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label for="picture" class="form-label">Picture URL:</label>
            <input
              v-model="newCategory.picture"
              id="picture"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label for="parent_id" class="form-label"
              >Parent ID (optional):</label
            >
            <input
              v-model.number="newCategory.parent_id"
              id="parent_id"
              type="number"
              class="form-control"
            />
          </div>
          <button type="submit" class="btn btn-primary">Create Category</button>
        </form>
        <div v-if="createError" class="alert alert-danger mt-3">
          {{ createError }}
        </div>
        <div v-if="createSuccess" class="alert alert-success mt-3">
          {{ createSuccess }}
        </div>
      </div>
    </div>

    <!-- Update Category Form -->
    <div id="updateForm" class="card mb-4">
      <div class="card-header">
        <h2 class="card-title">Update Category</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="updateCategory">
          <div class="mb-3">
            <label for="update_id" class="form-label">Category ID:</label>
            <input
              v-model.number="updateCategoryId"
              id="update_id"
              type="number"
              class="form-control"
              readonly
            />
          </div>
          <div class="mb-3">
            <label for="update_name" class="form-label"
              >New Category Name:</label
            >
            <input
              v-model="updateCategoryData.name"
              id="update_name"
              type="text"
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label for="update_picture" class="form-label"
              >New Picture URL:</label
            >
            <input
              v-model="updateCategoryData.picture"
              id="update_picture"
              type="text"
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label for="update_parent_id" class="form-label"
              >New Parent ID (optional):</label
            >
            <input
              v-model.number="updateCategoryData.parent_id"
              id="update_parent_id"
              type="number"
              class="form-control"
            />
          </div>
          <button type="submit" class="btn btn-warning">Update Category</button>
        </form>
        <div v-if="updateError" class="alert alert-danger mt-3">
          {{ updateError }}
        </div>
        <div v-if="updateSuccess" class="alert alert-success mt-3">
          {{ updateSuccess }}
        </div>
      </div>
    </div>

    <!-- Delete Category Form -->
    <div class="card mb-4">
      <div class="card-header">
        <h2 class="card-title">Delete Category</h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="deleteCategory">
          <div class="mb-3">
            <label for="delete_id" class="form-label">Category ID:</label>
            <input
              v-model.number="deleteCategoryId"
              id="delete_id"
              type="number"
              class="form-control"
              required
            />
          </div>
          <button type="submit" class="btn btn-danger">Delete Category</button>
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
import { ref, onMounted } from "vue";

const newCategory = ref({
  name: "",
  picture: "",
  parent_id: null,
});

const updateCategoryId = ref(null);
const updateCategoryData = ref({
  name: "",
  picture: "",
  parent_id: null,
});

const deleteCategoryId = ref(null);

const categories = ref([]);
const createError = ref(null);
const createSuccess = ref(null);
const updateError = ref(null);
const updateSuccess = ref(null);
const deleteError = ref(null);
const deleteSuccess = ref(null);
const fetchError = ref(null);

const createCategory = async () => {
  try {
    await $fetch("/api/categories", {
      method: "POST",
      body: newCategory.value,
    });
    createSuccess.value = "Category created successfully!";
    createError.value = null;
    newCategory.value = {
      name: "",
      picture: "",
      parent_id: null,
    }; // Reset form
    fetchCategories(); // Refresh category list
  } catch (err) {
    createError.value =
      "Failed to create category: " +
      (err.response?.data?.error || err.message);
    createSuccess.value = null;
  }
};

const updateCategory = async () => {
  try {
    await $fetch(`/api/categories?id=${updateCategoryId.value}`, {
      method: "PUT",
      body: updateCategoryData.value,
    });
    updateSuccess.value = "Category updated successfully!";
    updateError.value = null;
    fetchCategories(); // Refresh category list
  } catch (err) {
    updateError.value =
      "Failed to update category: " +
      (err.response?.data?.error || err.message);
    updateSuccess.value = null;
  }
};

const deleteCategory = async () => {
  try {
    const response = await $fetch(
      `/api/categories?id=${deleteCategoryId.value}`,
      {
        method: "DELETE",
      }
    );
    if (response.message) {
      deleteSuccess.value = response.message;
      deleteError.value = null;
      fetchCategories(); // Refresh category list
    } else {
      throw new Error(response.error || "Failed to delete category");
    }
  } catch (err) {
    deleteError.value =
      "Failed to delete category: " +
      (err.response?.data?.error || err.message);
    deleteSuccess.value = null;
  }
};

const fetchCategories = async () => {
  try {
    categories.value = await $fetch("/api/categories");
    fetchError.value = null;
  } catch (err) {
    fetchError.value =
      "Failed to fetch categories: " +
      (err.response?.data?.error || err.message);
  }
};

const editCategory = (category) => {
  updateCategoryId.value = category.id;
  updateCategoryData.value = {
    name: category.name,
    picture: category.picture,
    parent_id: category.parent_id,
  };
  // Scroll to the update form
  const updateForm = document.getElementById("updateForm");
  if (updateForm) {
    updateForm.scrollIntoView({ behavior: "smooth" });
  }
};

// Fetch categories when the component is mounted
onMounted(fetchCategories);
</script>

<style scoped>
.error {
  color: red;
}

.success {
  color: green;
}

.card-header {
  background-color: #f8f9fa;
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.list-group-item {
  display: flex;
  align-items: center;
}

.img-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.me-3 {
  margin-right: 1rem; /* Adjust spacing as needed */
}
</style>
