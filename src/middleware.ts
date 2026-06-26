// src/middleware.ts

// import { defineMiddleware } from "astro:middleware";

// export const onRequest = defineMiddleware(async (context, next) => {
//     if (context.url.pathname === "/") {
//         const locale = context.preferredLocale ?? "en";
        
//         return context.redirect(`/${locale}`);
//     }

//     return next();
// });