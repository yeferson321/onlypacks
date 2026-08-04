// src/middleware.ts
import { defineMiddleware } from "astro:middleware";

// export const onRequest = defineMiddleware((context, next) => {
//     const sesionId = context.cookies.get("sesion_id")?.value;

//     if (!sesionId) {
//         return context.redirect("/");
//     }

//     return next();
// });