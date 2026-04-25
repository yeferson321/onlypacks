const target = new EventTarget()

type EventMap = {
  	tabchange: { tab: string };
  	toastshow: { id: string };
};

export function emit<K extends keyof EventMap>(name: K, data: EventMap[K]): void {
  	target.dispatchEvent(
  	  	new CustomEvent(name, {	detail: data })
  	);
};

export function on<K extends keyof EventMap>(name: K, callback: (data: EventMap[K]) => void): () => void {
  	const handler = (event: Event) => {
  	  	const { detail } = event as CustomEvent<EventMap[K]>;
    	callback(detail);
  	};

  	target.addEventListener(name, handler);

  	return () => target.removeEventListener(name, handler);
};