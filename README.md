# Nuxt 3 Full Stack Developer Assignment

This project is a full-stack application developed using Nuxt 3, Prisma, and MySQL. It includes features for managing categories and products, image resizing, and a structured API setup.

## Project Overview

The project implements CRUD operations for categories and products. It features categories displayed as a tree structure, with the ability to count products within nested categories. Images uploaded for products are resized to 3200x3200 pixels. The project is containerized using Docker for easy deployment.

## Technologies Used

- **Frontend & Backend:** Nuxt 3
- **Database:** MySQL
- **ORM:** Prisma
- **Containerization:** Docker
- **API Testing:** Postman

## Prerequisites

Ensure you have the following installed on your system:

- Node.js (v14 or above)
- npm, pnpm, yarn, or bun (package managers)
- Docker
- MySQL

## Setup

### 1. Install Dependencies

Use your preferred package manager to install the required dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory and set the following environment variables:

```bash
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# Cloud service credentials (example: Cloudinary)
CLOUD_NAME=<add-your-cloudname>
API_KEY=<add-your-apikey>
API_SECRET=<add-your-apisecret>
```

Replace `user`, `password`, and `database_name` with your actual MySQL credentials.

### 3. Database Setup

Run Prisma migrations to set up the database schema:

```bash
npx prisma migrate dev --name init
```

### 4. Seed the Database (Optional)

If you have seed data, use the following command to populate the database:

```bash
npx prisma db seed
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

### Build the Application

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

### Preview Production Build

Locally preview the production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [Nuxt 3 deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Docker Deployment

### Build and Run the Docker Container

```bash
docker build -t nuxt-fullstack-assignment .
docker run -p 3000:3000 nuxt-fullstack-assignment
```

The application will be available at `http://localhost:3000`.

## API Documentation

API documentation is available via Postman. Import the collection using the following link:
[Postman Collection](#)

## Scripts

### Migration & Build Scripts

- **Migrate Database:** `npx prisma migrate dev --name init`
- **Build Application:** `npm run build`

## Contact

For any questions or issues, please contact: [ramynabil680@gmail.com](mailto:ramynabil680@gmail.com)

---

### Notes:

- Replace placeholders like `user`, `password`, `database_name`, and Postman collection link with actual details.
- Include any additional setup or configuration steps specific to your project.
- Ensure that the `.env` file is not committed to your public repository to protect sensitive information.
