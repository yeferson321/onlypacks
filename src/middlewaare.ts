// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
// import { validateSession } from "@/lib/auth";


async function hashToken(rawToken: string) {
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(rawToken));
    return Buffer.from(digest).toString("hex");
}

export async function validateSession(rawToken: string | undefined) {
    if (!rawToken) return null;

    const tokenHash = await hashToken(rawToken);

    // const { data: session, error } = await supabase
    //     .from('sessions')
    //     .select('id, account_id, expires_at')
    //     .eq('token_hash', tokenHash)
    //     .single();

    // if (error || !session) return null;

    // ¿Expiró?
    // if (new Date(session.expires_at) < new Date()) {
    //     // opcional: borra la sesión vencida de una vez
    //     await supabase.from('sessions').delete().eq('id', session.id);
    //     return null;
    // }

    return session; // { id, account_id, expires_at }
}

export const onRequest = defineMiddleware(async (context, next) => {
    const rawToken = context.cookies.get("session")?.value;
    const session = await validateSession(rawToken);

    if (session) {
        // context.locals.accountId = session.account_id;
    } else {
        // context.locals.accountId = null;
        // si el token existía pero no era válido, límpialo
        
        if (rawToken) context.cookies.delete("session", { path: "/" });
    }

    return next();
});