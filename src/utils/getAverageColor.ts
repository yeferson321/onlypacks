type RGBColor = {
    r: number;
    g: number;
    b: number;
};

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

export const getAverageColor = (img: HTMLImageElement): RGBColor => {
    try {
        if (!ctx) throw new Error("Canvas context not available");

        const size = 50
        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(img, 0, 0, size, size);

        const { data } = ctx.getImageData(0, 0, size, size);

        let r = 0, g = 0, b = 0;
        const count = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }

        const boost = 2;
        const vivid = (v: number) => Math.min(255, Math.max(0, Math.round(128 + (v / count - 128) * boost)));

        console.log(vivid(r), vivid(g), vivid(b))
        return { r: vivid(r), g: vivid(g), b: vivid(b) };
    } catch {
        return { r: 0, g: 0, b: 0 };
    }
};