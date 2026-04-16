import { useEffect, useState, useRef, useMemo } from 'react';
import { on } from '@/utils/events';

type PostType = "image" | "video" | "audio";

interface Post {
	postId: string;
    type: PostType;
    url: string;
};

interface Props {
    username?: string;
	tab: string;
    posts: Post[];
};

export function GalleryReact({ username, tab, posts }: Props) {
	const initialVisible = 12;
	const [currentTab, setCurrentTab] = useState(tab);
  	const [visible, setVisible] = useState(initialVisible);
  	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	const validTypes = ["image","video","audio"];
	// memoize filtered posts
  	const filteredPosts = useMemo(() => {
  	  	return validTypes.includes(currentTab) ? posts.filter((p) => p.type === currentTab) : posts;
  	}, [posts, currentTab]);

	useEffect(() => {
  	  	const unsubscribe = on("tabchange", ({ tab }) => {
  	  	  	setCurrentTab(tab);
  	  	  	setVisible(initialVisible); // reset del infinite scroll
  	  	});
	  
  	  	return unsubscribe;
  	}, []);

	useEffect(() => {
  	  	const observer = new IntersectionObserver(
  	  	  	(entries) => {
  	  	  	  	if (entries[0].isIntersecting) setVisible((previous) => previous + initialVisible);
  	  	  	},
  	  	  	{ rootMargin: "300px" }
  	  	);

  	  	if (loadMoreRef.current) observer.observe(loadMoreRef.current);

  	  	return () => observer.disconnect();
  	}, []);

    return (
		<>
		
			<div className="grid grid-cols-2 md:grid-cols-3 gap-2 px-4">

    			{ filteredPosts.slice(0, visible).map((item) => (
				
				    <a key={item.postId} href={`/${username}/${item.postId}`} className="relative aspect-square overflow-hidden" data-type={item.type}>

				        {item.type === "audio" && (
				            <img src="https://picsum.photos/seed/post-3/400.jpg" loading="lazy" decoding="async" className="h-full w-full object-cover rounded-2xl"  alt=""/>
				        )}
				        {item.type === "image" && (
				            <img loading="lazy" decoding="async" className="h-full w-full object-cover rounded-2xl" src={item.url} alt=""/>
				        )}
				        {item.type === "video" && (
				            <video className="h-full w-full object-cover rounded-2xl" preload="metadata" muted playsInline>
				                <source src={item.url} type="video/mp4" />
				            </video>
				        )}
         
            			<div className="absolute inset-0 flex items-center justify-center icon-container">
            			    {item.type === "image" && (
								<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-neutral-700" aria-hidden="true" strokeWidth="1.5" width="28" height="28">
								  	<path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"></path>
								</svg>
							)}
                    		{item.type === "video" && (
								<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-neutral-700" aria-hidden="true" strokeWidth="1.5" width="28" height="28">
								  	<path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"></path>
								</svg>
							)}
                   			{item.type === "audio" && (
								<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="stroke-neutral-700" aria-hidden="true" strokeWidth="1.5" width="28" height="28">
								  	<path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"></path>
								</svg>
							)}
            			</div>
        
				    </a>

				))} 

			</div>

			<div ref={loadMoreRef} id="load-more" className="p-4"></div>

		</>
	)
}