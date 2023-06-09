'use client'

import Link from "next/link"

export default function Custom404() {
    return (
        <main className="grid h-[85vh] min-w-[275px] place-items-center px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center overflow-hidden">
                <p className="text-base font-semibold text-white">404</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">Page not found</h1>
                <p className="mt-6 text-base leading-7 text-white">Sorry, we couldn’t find the page you’re looking for.</p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link href="#" className="rounded-md bg-amber-500 hover:bg-amber-600 px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">
                        Go back home
                    </Link>
                </div>
            </div>
        </main>
    )
}