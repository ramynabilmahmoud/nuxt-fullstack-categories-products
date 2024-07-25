import { defineEventHandler, readBody, getQuery } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  try {
    switch (method) {
      case "GET":
        const products = await prisma.products.findMany({
          include: { category: true },
        });
        return products;

      case "POST":
        const data = await readBody(event);
        const newProduct = await prisma.products.create({ data });
        return newProduct;

      case "PUT":
        const id = Number(getQuery(event).id);
        const updateData = await readBody(event);

        const updatedProduct = await prisma.products.update({
          where: { id },
          data: {
            name: updateData.name,
            picture: updateData.picture,
            category: updateData.category_id
              ? {
                  connect: { id: updateData.category_id },
                }
              : undefined,
          },
        });
        return updatedProduct;

      case "DELETE":
        const deleteId = Number(getQuery(event).id);
        await prisma.products.delete({ where: { id: deleteId } });
        return { message: "Product deleted successfully" };

      default:
        return { error: "Method not allowed" };
    }
  } catch (error) {
    console.error(error);
    return { error: "Internal server error" };
  }
});
