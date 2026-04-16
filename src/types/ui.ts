// src/types/ui.ts

type SocialLink = {
	platform: string;
	url: string;
};

type ProfileStats = {
	images: number;
	videos: number;
	audios: number;
	likes: number;
};

type RGB = {
  	r: number;
  	g: number;
  	b: number;
};

export type ImageData = {
  	url: string;
  	avgColor: RGB;
};

export type Profile = {
	activeSubscription: boolean;
	name: string;
	username: string;
	isVerified: boolean;
	stats: ProfileStats;
	socialLinks: SocialLink[];
	presentation: string;
	stories: ImageData[];

	/* profileImage: string;
	coverImage: string; */
};