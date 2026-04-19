/* import { useEffect, useState, useRef } from 'react';

export function VideoMedia({ src }: { src: string }) {
    const [loaded, setLoaded] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const video = videoRef.current;

        // 🔥 clave SSR/cache igual que en imágenes
        if (video && video.readyState >= 2) setLoaded(true);
    }, []);

    return (
        <>
            {!loaded && ( <div className="absolute inset-0 bg-red-200 animate-pulse rounded-2xl"></div> )}

            <video ref={videoRef} className="h-full w-full object-cover rounded-2xl" preload="metadata" muted playsInline onLoadedData={() => setLoaded(true)} onError={() => setLoaded(true)}>
                <source src={src} type="video/mp4" />
            </video>
        </>
    );
}; */