// server/api/categories.ts

import { defineEventHandler, readBody, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const prisma = new PrismaClient();

function countProducts(category) {
  let count = category.products.length;
  category.children.forEach((child) => {
    count += countProducts(child);
  });
  return count;
}

function buildCategoryTreeWithCounts(categories) {
  const map = new Map();
  categories.forEach((cat) =>
    map.set(cat.id, { ...cat, children: [], productCount: 0 })
  );

  const tree = [];

  categories.forEach((cat) => {
    if (cat.parent_id) {
      const parent = map.get(cat.parent_id);
      if (parent) {
        parent.children.push(map.get(cat.id));
      }
    } else {
      tree.push(map.get(cat.id));
    }
  });

  tree.forEach((root) => {
    root.productCount = countProducts(root);
  });

  return tree;
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  try {
    switch (method) {
      case "GET":
        const categories = await prisma.categories.findMany({
          include: { children: true, products: true },
        });
        const categoryTree = buildCategoryTreeWithCounts(categories);
        return categoryTree;

      case "POST":
        const createData = await readBody(event);
        console.log(createData);
        console.log("===================================");
        let pictureUrl = "";
        if (createData.picture) {
          // Upload image to Cloudinary
          const uploadResult = await cloudinary.v2.uploader.upload(
            createData.picture,
            {
              folder: "categories", // Optional: folder in Cloudinary
            }
          );

          pictureUrl = uploadResult.secure_url;
          console.log(pictureUrl);
        }

        // Save category with image URL
        const newCategory = await prisma.categories.create({
          data: {
            ...createData,
            picture: pictureUrl, // Save the image URL in the database
          },
        });
        return newCategory;

      case "PUT":
        const updateId = Number(getQuery(event).id);
        const updateData = await readBody(event);
        let picUrl = updateData.picture;
        if (updateData.picture && updateData.picture !== "") {
          const uploadResult = await cloudinary.v2.uploader.upload(
            updateData.picture,
            {
              folder: "categories", // Optional: folder in Cloudinary
            }
          );
          picUrl = uploadResult.secure_url;
        }
        const updatedCategory = await prisma.categories.update({
          where: { id: updateId },
          data: {
            ...updateData,
            picture: picUrl,
          },
        });
        return updatedCategory;

      case "DELETE":
        const deleteId = Number(getQuery(event).id);

        // Check for associated products and children before deletion
        const childCategories = await prisma.categories.findMany({
          where: { parent_id: deleteId },
        });
        const productsInCategory = await prisma.products.findMany({
          where: { category_id: deleteId },
        });

        if (childCategories.length > 0 || productsInCategory.length > 0) {
          return {
            statusCode: 400,
            body: {
              error:
                "Category has associated records. Handle them before deletion.",
            },
          };
        }

        await prisma.categories.delete({
          where: { id: deleteId },
        });
        return { message: "Category deleted successfully" };

      default:
        return { statusCode: 405, body: { error: "Method not allowed" } };
    }
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: { error: "Internal server error" } };
  }
});
