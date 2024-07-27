import { defineEventHandler, readBody, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";
import cloudinary from "cloudinary";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const prisma = new PrismaClient();

async function buildCategoryTree(categories) {
  const categoryMap = new Map();

  // Map categories by ID
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Build the tree structure
  const rootCategories = [];
  categoryMap.forEach((category) => {
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
}

function countProducts(category) {
  const products = category.products || [];
  const children = category.children || [];

  let count = products.length;

  // Recursively accumulate product counts from children
  children.forEach((child) => {
    count += countProducts(child).productCount;
  });

  return { ...category, productCount: count };
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  try {
    switch (method) {
      case "GET":
        const categories = await prisma.categories.findMany({
          include: {
            children: {
              include: {
                children: true,
                products: true,
              },
            },
            products: true,
          },
        });

        const categoryTree = await buildCategoryTree(categories);

        // Ensure categoryTree is an array
        if (!Array.isArray(categoryTree)) {
          throw new Error("Category tree is not an array.");
        }

        const categoriesWithProductCount = categoryTree.map((category) =>
          countProducts(category)
        );

        return categoriesWithProductCount;

      case "POST":
        const createData = await readBody(event);
        let pictureUrl = "";
        if (createData.picture) {
          // Convert base64 string to buffer
          const picture = createData.picture.substring(
            createData.picture.indexOf(",") + 1
          );
          const imageBuffer = Buffer.from(picture, "base64");
          // Resize the image to fit within 3200x3200
          const resizedBuffer = await sharp(imageBuffer)
            .resize(3200, 3200, { fit: "inside" })
            .toBuffer();

          // Upload resized image to Cloudinary
          pictureUrl = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.v2.uploader.upload_stream(
              { folder: "categories" }, // Optional: specify a folder in Cloudinary
              (error, result) => {
                if (error) {
                  return reject(error);
                }
                resolve(result.secure_url);
              }
            );

            // Stream the buffer to Cloudinary
            uploadStream.end(resizedBuffer);
          });
        }

        // Save the category with the image URL
        const newCategory = await prisma.categories.create({
          data: {
            ...createData,
            parent_id: createData.parent_id || null, // Ensure parent_id is correctly set or null if no parent
            picture: pictureUrl,
          },
        });

        return newCategory;

      case "PUT":
        const updateId = Number(getQuery(event).id);
        const updateData = await readBody(event);

        // Fetch the current category to get the existing picture URL
        const currentCategory = await prisma.categories.findUnique({
          where: { id: updateId },
          select: { picture: true },
        });

        let picUrl = currentCategory ? currentCategory.picture : null;

        if (updateData.picture) {
          if (updateData.picture.startsWith("http")) {
            // The new picture is a URL and should be used directly
            if (updateData.picture !== picUrl) {
              // Update URL if it's different
              picUrl = updateData.picture;
            }
          } else {
            // The new picture is in base64 format, so we need to process it
            const picture = updateData.picture.substring(
              updateData.picture.indexOf(",") + 1
            );
            const imageBuffer = Buffer.from(picture, "base64");
            const resizedBuffer = await sharp(imageBuffer)
              .resize(3200, 3200, { fit: "inside" })
              .toBuffer();

            // Upload resized image to Cloudinary
            picUrl = await new Promise((resolve, reject) => {
              const uploadStream = cloudinary.v2.uploader.upload_stream(
                { folder: "categories" }, // Optional: specify a folder in Cloudinary
                (error, result) => {
                  if (error) {
                    return reject(error);
                  }
                  resolve(result.secure_url);
                }
              );

              // Stream the buffer to Cloudinary
              uploadStream.end(resizedBuffer);
            });
          }
        }

        // Update the category with new data
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
            message:
              "Category has associated records. Handle them before deletion.",
          };
        }

        await prisma.categories.delete({
          where: { id: deleteId },
        });
        return { message: "Category deleted successfully" };

      default:
        return "Method not allowed";
    }
  } catch (error) {
    console.error("Error:", error);
    return { error: "Internal server error" };
  }
});
