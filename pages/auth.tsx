import React, { useState } from 'react'
import Image from 'next/image'
import { SearchIcon, UsersIcon, ChatIcon } from '@heroicons/react/outline'
import { getProviders, getSession, signIn } from 'next-auth/react'
import Head from 'next/head'
import AnimatedButton from '../components/AnimatedButton'

interface Props {
  providers: any
}

const Auth = ({ providers }: Props) => {

  const [signUp, setSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleAuth = (provider: any) => {
    if (signUp) {

    } else {
      signIn(provider.id, { callbackUrl: "/" })
    }
  }

  return (
    <div className="flex h-screen w-screen">
      <Head>
        <title>Login to Twitter 2.0</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex-1 bg-lightblue-500 flex flex-col justify-center items-center p-24">
        <div className="space-y-5">
          <div className="flex space-x-3">
            <SearchIcon className="h-5 w-5" />
            <p>Follow your interests.</p>
          </div>

          <div className="flex space-x-3">
            <UsersIcon className="h-5 w-5" />
            <p>Hear what people are talking about.</p>
          </div>

          <div className="flex space-x-3">
            <ChatIcon className="h-5 w-5" />
            <p>Join the conversation.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-24">
        <div>
          <Image src="https://rb.gy/ogau5a" alt="" height={30} width={30} className="text-lightblue-500" />
          <h2 className="text-2xl font-bold">See what's happening in the world right now</h2>
          <h6 className="font-bold">Join Twitter 2.0 today</h6>

          <form>
            <input className="w-full p-3 bg-black border border-gray-500 rounded-lg focus:outline-none mb-3" placeholder="Username"></input>
            <input className="w-full p-3 bg-black border border-gray-500 rounded-lg focus:outline-none mb-3" placeholder="Password"></input>
          </form>

          <AnimatedButton handleAuth={handleAuth} provider={{ id: 'email' }} authName={'email'} signUp={signUp} />

          {Object.values(providers).map((provider: any) => (
            <div key={provider.name} className="py-3">

              <AnimatedButton handleAuth={handleAuth} provider={provider} authName={provider.name} signUp={signUp} />

              {!signUp && <div>Don't have an account? <a className="text-lightblue-400 cursor-pointer hover:underline" onClick={() => setSignUp(true)}>Sign up</a></div>}

              {signUp && <div>Already have an account? <a className="text-lightblue-400 cursor-pointer hover:underline" onClick={() => setSignUp(false)}>Sign in</a></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Auth


export const getServerSideProps = async (context) => {
  const trendingResults = await fetch("https://jsonkeeper.com/b/NKEV").then((res) => res.json())

  const followResults = await fetch("https://jsonkeeper.com/b/WWMJ").then((res) => res.json());

  const providers = await getProviders()
  const session = await getSession(context)

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session
    }
  }
}