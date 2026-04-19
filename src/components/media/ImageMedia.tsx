/* import { useEffect, useState, useRef } from 'react';

export function ImageMedia({ src }: { src: string }) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // When src changes, check if the image is already complete (cached).
    // If it's complete -> mark loaded immediately; otherwise ensure skeleton shows.
    useEffect(() => {
        const img = imgRef.current;
        if (img && img.complete) setLoaded(true);
    }, []);

    return (
        <>
            {!loaded && ( <div className="absolute inset-0 bg-red-200 animate-pulse rounded-2xl" /> )}

            <img ref={imgRef} src={src} loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} className="h-full w-full object-cover rounded-2xl" alt=""/>
        </>
    );
}; */