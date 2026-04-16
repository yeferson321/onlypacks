type EventMap = {
  tabchange: {
    tab: string
  }
}

const target = new EventTarget()

export function emit<K extends keyof EventMap>(
  name: K,
  data: EventMap[K]
): void {

  window.dispatchEvent(
    new CustomEvent(name, {
      detail: data
    })
  )

}

export function on<K extends keyof EventMap>(
  name: K,
  callback: (data: EventMap[K]) => void
): () => void {

  const handler = (event: Event) => {
    const custom = event as CustomEvent<EventMap[K]>
    callback(custom.detail)
  }

  target.addEventListener(name, handler)

  return () => target.removeEventListener(name, handler)

}