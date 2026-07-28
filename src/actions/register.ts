import { defineAction } from "astro:actions";
import { z } from "astro/zod";
// import PBKDF2Lite from "pbkdf2-lite";

const normalize = (value: string) => value.normalize("NFC");

// const hasher = new PBKDF2Lite();

import { argon2id, argon2Verify } from "hash-wasm";

async function hash(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  return argon2id({
    password,
    salt,
    parallelism: 1,        // Workers son single-threaded, no ganas nada subiendo esto
    iterations: 3,         // "time cost" — ajusta según tu límite de CPU
    memorySize: 19456,     // en KiB (19456 = ~19 MB) — el parámetro más importante para seguridad
    hashLength: 32,
    outputType: "encoded", // devuelve el string PHC ya formateado, con salt e iteraciones incluidas
  });
}

export const register = defineAction({
        input: z.object({
            name: z.string().min(6).max(120),
            newPassword: z.string().min(8).max(64),
        }),

        handler: async ({ name, newPassword }) => {

            console.log("WebAssembly:", typeof WebAssembly);

try {
  const bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d,
    0x01, 0x00, 0x00, 0x00
  ]);

  await WebAssembly.compile(bytes);

  console.log("WASM OK");
} catch (e) {
  console.error("WASM ERROR", e);
}
console.log({
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

            const normalizedPassword = normalize(newPassword);

            // const passwordHash = await argon2.hash(normalizedPassword, {
            //     type: argon2.argon2id,
            // });
            const passwordHash = await hash(normalizedPassword);

            console.log("passwordHash", passwordHash);

            // TODO: Guardar en la base de datos
            // await db.users.create({
            //     name: normalize(name),
            //     password: passwordHash,
            // });

            return {
                success: true,
            };
        },
    })


// export const server = {
//     getUserByUsername: defineAction({
//         input: z.object({
//             username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9._]+$/),
//         }),
      
//         handler: async ({ username }) => {

//             const user = users.find(
//                 (user) => user.username.toLowerCase() === username.toLowerCase()
//             );
          
//             if (!user) {
//                 throw new Error("User not found");
//             }
          
//             return user;
//         },
//     }),
// };
