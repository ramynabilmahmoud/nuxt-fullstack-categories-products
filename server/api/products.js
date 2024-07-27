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

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  try {
    switch (method) {
      case "GET":
        // Fetch all products including their associated category
        const products = await prisma.products.findMany({
          include: { category: true },
        });
        return products;

      case "POST":
        // Create a new product
        const createData = await readBody(event);
        let pictureUrl = "";

        if (createData.picture) {
          // Convert base64 string to buffer
          const picture = createData.picture.substring(
            createData.picture.indexOf(",") + 1
          );
          const imageBuffer = Buffer.from(picture, "base64");

          // Resize the image if necessary
          const resizedBuffer = await sharp(imageBuffer)
            .resize(3200, 3200, { fit: "inside" })
            .toBuffer();

          // Upload to Cloudinary
          pictureUrl = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.v2.uploader.upload_stream(
              { folder: "products" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
              }
            );
            uploadStream.end(resizedBuffer);
          });
        }

        const newProduct = await prisma.products.create({
          data: {
            ...createData,
            picture: pictureUrl,
          },
        });
        return newProduct;

      case "PUT":
        const updateId = Number(getQuery(event).id);
        const updateData = await readBody(event);

        // Fetch the current category to get the existing picture URL
        const currentProduct = await prisma.products.findUnique({
          where: { id: updateId },
          select: { picture: true },
        });

        let picUrl = currentProduct ? currentProduct.picture : null;

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
                { folder: "products" }, // Optional: specify a folder in Cloudinary
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
        const updatedProduct = await prisma.products.update({
          where: { id: updateId },
          data: {
            ...updateData,
            picture: picUrl,
          },
        });

        return updatedProduct;

      case "DELETE":
        // Delete a product
        const deleteId = Number(getQuery(event).id);
        await prisma.products.delete({
          where: { id: deleteId },
        });
        return { message: "Product deleted successfully" };

      default:
        return { error: "Method not allowed" };
    }
  } catch (error) {
    console.error("Error:", error);
    return { error: "Internal server error" };
  }
});
