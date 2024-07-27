<template>
  <link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
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
              class="list-group-item"
            >
              <div class="d-flex align-items-center">
                <span
                  @click="toggleChildren(category)"
                  class="toggle-arrow me-2"
                >
                  {{ isOpen(category) ? "▼" : "►" }}
                </span>
                <img
                  v-if="category.picture"
                  :src="category.picture"
                  alt="Category Image"
                  class="img-thumbnail me-4"
                  style="width: 100px; height: 100px; object-fit: cover"
                />
                <div>
                  <h5 class="mb-1">{{ category.name }}</h5>
                  <p class="mb-1"><strong>ID:</strong> {{ category.id }}</p>
                  <p class="mb-1">
                    <strong>Parent ID:</strong> {{ category.parent_id }}
                  </p>
                  <p v-if="isTopLevel" class="mb-1">
                    <strong>Total Product count:</strong>
                    {{ category.productCount }}
                  </p>
                  <button
                    class="btn btn-warning btn-sm mt-2"
                    @click="editCategory(category)"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <ul
                v-if="
                  isOpen(category) &&
                  Array.isArray(category.children) &&
                  category.children.length
                "
                class="list-group mt-3"
              >
                <li
                  v-for="child in category.children"
                  :key="child.id"
                  class="list-group-item"
                >
                  <!-- Render child content similar to parent -->
                  <div class="d-flex align-items-center">
                    <span
                      @click="toggleChildren(child)"
                      class="toggle-arrow me-2"
                    >
                      {{ isOpen(child) ? "▼" : "►" }}
                    </span>
                    <img
                      v-if="child.picture"
                      :src="child.picture"
                      alt="Category Image"
                      class="img-thumbnail me-4"
                      style="width: 80px; height: 80px; object-fit: cover"
                    />
                    <div>
                      <h6 class="mb-1">{{ child.name }}</h6>
                      <p class="mb-1"><strong>ID:</strong> {{ child.id }}</p>
                      <p class="mb-1">
                        <strong>Parent ID:</strong> {{ child.parent_id }}
                      </p>
                      <button
                        class="btn btn-warning btn-sm mt-2"
                        @click="editCategory(child)"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
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
            <label for="picture" class="form-label">Picture:</label>
            <input
              @change="handleFileUpload($event, 'create')"
              type="file"
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
            <label for="update_picture" class="form-label">New Picture:</label>
            <input
              @change="handleFileUpload($event, 'update')"
              type="file"
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
        <form @submit.prevent="handleDeleteCategory">
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
            Are you sure you want to delete this category? This action cannot be
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
              @click="confirmDeleteCategory"
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

const props = defineProps({
  tree: {
    type: Array,
    required: true,
  },
  isTopLevel: {
    type: Boolean,
    default: true,
  },
});

const deleteCategoryId = ref(null);
const editCategoryData = ref(null);
const openCategories = ref(new Set());

const categories = ref([]);
const createError = ref(null);
const createSuccess = ref(null);
const updateError = ref(null);
const updateSuccess = ref(null);
const deleteError = ref(null);
const deleteSuccess = ref(null);
const fetchError = ref(null);

// Function to convert file to base64
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
      newCategory.value.picture = base64;
    } else if (type === "update") {
      updateCategoryData.value.picture = base64;
    }
  }
};

const toggleChildren = (category) => {
  if (openCategories.value.has(category.id)) {
    openCategories.value.delete(category.id);
  } else {
    openCategories.value.add(category.id);
  }
};

const isOpen = (category) => {
  return openCategories.value.has(category.id);
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

const handleDeleteCategory = () => {
  $("#deleteConfirmationModal").modal("show");
};

const confirmDeleteCategory = async () => {
  try {
    await $fetch(`/api/categories?id=${deleteCategoryId.value}`, {
      method: "DELETE",
    });
    deleteSuccess.value = "Category deleted successfully!";
    deleteError.value = null;
    deleteCategoryId.value = null; // Reset form
    $("#deleteConfirmationModal").modal("hide");
    fetchCategories(); // Refresh category list
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

// Fetch categories on component mount
onMounted(() => {
  fetchCategories();
});

const handleEditCategory = (category) => {
  editCategoryData.value = { ...category };
  updateCategoryId.value = category.id;
};
</script>

<style scoped>
.toggle-arrow {
  cursor: pointer;
}

.list-group-item {
  position: relative;
}

.list-group-item .d-flex {
  align-items: center;
}

.list-group-item img {
  margin-right: 15px;
}

.list-group-item h5 {
  margin-bottom: 5px;
}

.list-group-item p {
  margin-bottom: 0;
}

.list-group-item ul {
  margin-top: 15px;
}
</style>
