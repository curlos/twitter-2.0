import React from 'react'
import Image from 'next/image'
import { SearchIcon, UsersIcon, ChatIcon } from '@heroicons/react/outline'
import { signIn } from 'next-auth/react'

interface Props {
  providers: any
}

const Login = ({ providers }: Props) => {

  console.log(providers)

  return (
    <div className="flex h-screen w-screen">
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
          {Object.values(providers).map((provider: any) => (
            <div key={provider.name} className="py-3">

              <button
                className="relative inline-flex items-center justify-start px-6 py-3 overflow-hidden font-medium transition-all bg-white rounded hover:bg-white group"
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
              >
                <span className="w-48 h-48 rounded rotate-[-40deg] bg-[#1d9bf0] absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
                <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white">
                  <div className="flex items-center space-x-2">
                    <img src="/assets/google.png" alt="Google Logo" className="h-5 w-5" />
                    <div>Sign in with {provider.name}</div>
                  </div>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Login
