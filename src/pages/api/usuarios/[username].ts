export const prerender = false;

import data from "@/utils/data.json";

export async function GET({ params }: { params: { username: string } }) {
    const { username } = params;

    const usuario = data.find((data) => data.username.toLocaleLowerCase() === username);

    if (!usuario) {
        return new Response(JSON.stringify({ error: "No encontrado" }), {
            status: 404
        });
    }

    return new Response(JSON.stringify(usuario));
}