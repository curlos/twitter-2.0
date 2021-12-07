import Head from 'next/head'
import React from 'react'
import Feed from '../components/Feed'
import Sidebar from '../components/Sidebar'

export default function Home() {
  return (
    <div className="px-12 min-h-screen min-w-screen">
      <Head>
        <title>Twitter 2.0</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-black min-h-screen flex max-w-[1500px] mx-auto">
        <Sidebar />
        <Feed />
      </main>

    </div>
  )
}
