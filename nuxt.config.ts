// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: ["@nuxt/image", "@nuxt/image-edge"],
  image: {
    cloudinary: {
      baseURL: "https://res.cloudinary.com/deks6ftmi/image/upload/v1721936987",
    },
  },
});
