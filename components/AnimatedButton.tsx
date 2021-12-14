import React from 'react'

interface Props {
  handleAuth: any,
  provider: any,
  authName: any,
  signUp: any
}

const AnimatedButton = ({ handleAuth, provider, authName, signUp }: Props) => {
  return (
    <div className="w-full">
      <button
        className="relative inline-flex items-center justify-start px-6 py-3 mb-2 overflow-hidden font-medium transition-all bg-white rounded-full hover:bg-white group w-3/5"
        onClick={() => handleAuth(provider)}
      >
        <span className="w-full h-48 rounded rotate-[-40deg] bg-[#1d9bf0] absolute bottom-0 left-0 -translate-x-full ease-out duration-500 transition-all translate-y-full mb-9 ml-9 group-hover:ml-0 group-hover:mb-32 group-hover:translate-x-0"></span>
        <span className="relative w-full text-left text-black transition-colors duration-300 ease-in-out group-hover:text-white">
          <div className="flex items-center space-x-2">
            <img src="/assets/google.png" alt="Google Logo" className="h-5 w-5" />
            {!signUp && <div>Sign in with {authName}</div>}
            {signUp && <div>Sign up with {authName}</div>}
          </div>
        </span>
      </button>
    </div>
  )
}

export default AnimatedButton