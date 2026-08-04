// src/middleware.ts

// import { defineMiddleware } from "astro:middleware";
// import { type LocaleCode, isLocale, defaultLocale } from "@/i18n/config";

// export const getPreferredLocale = (acceptLanguage: string): LocaleCode => {
//   return (
//     acceptLanguage
//       .split(",")
//       .map((lang) => lang.split(";")[0].split("-")[0].trim())
//       .find(isLocale) ?? defaultLocale
//   );
// };

// export const onRequest = defineMiddleware((context, next) => {
//   const { pathname } = context.url;

//   const segments = pathname.split("/").filter(Boolean);

//   // No hay segmentos: "/"
//   if (segments.length === 0) {
//     return next();
//   }

//   const [locale, ...rest] = segments;

//  if (!isLocale(locale)) {
//     const preferredLocale = getPreferredLocale(
//       context.request.headers.get("Accept-Language") ?? ""
//     );

//     return context.redirect(`/${preferredLocale}/${rest.join("/")}`);
//   }

//   return next();
// });