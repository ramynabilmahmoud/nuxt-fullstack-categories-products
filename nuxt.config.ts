export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxt/image", "@nuxt/image-edge"],
  image: {
    cloudinary: {
      baseURL: "https://res.cloudinary.com/deks6ftmi/image/upload/v1721936987",
    },
  },
  app: {
    head: {
      script: [
        {
          src: "https://code.jquery.com/jquery-3.5.1.slim.min.js",
          defer: true,
        },
        {
          src: "https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js",
          defer: true,
        },
        {
          src: "https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js",
          defer: true,
        },
      ],
    },
  },
});
