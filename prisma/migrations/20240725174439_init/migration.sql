/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Categories_name_key` ON `Categories`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `Products_name_key` ON `Products`(`name`);
