/*
  Warnings:

  - Made the column `picture` on table `Categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Categories` MODIFY `picture` VARCHAR(191) NOT NULL;
