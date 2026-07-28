import { defineAction } from "astro:actions";
import { z } from "astro/zod";
import users from '@/utils/data.json';

export const getUserByUsername = defineAction({
        input: z.object({
            username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9._]+$/),
        }),
      
        handler: async ({ username }) => {

            const user = users.find(
                (user) => user.username.toLowerCase() === username.toLowerCase()
            );
          
            if (!user) {
                throw new Error("User not found");
            }
          
            return user;
        },
    })
