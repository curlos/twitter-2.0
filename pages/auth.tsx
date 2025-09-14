import React, { useState } from 'react';
import Image from 'next/image';
import { SearchIcon, UsersIcon, ChatIcon } from '@heroicons/react/outline';
import { getProviders, getSession, signIn } from 'next-auth/react';
import Head from 'next/head';
import AnimatedButton from '../components/AnimatedButton';
import { IProvider } from '../utils/types';

interface Props {
  providers: [IProvider];
}

const Auth = ({ providers }: Props) => {

  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = (provider: IProvider) => {
    if (signUp) {
      // This is for OAuth signup - same as signin for OAuth providers
      signIn(provider.id, { callbackUrl: "/" });
    } else {
      signIn(provider.id, { callbackUrl: "/" });
    }
  };

  const handleCredentialAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (signUp) {
        // Handle registration
        if (!name || !email || !password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (response.ok) {
          // Registration successful, now sign in
          const result = await signIn('credentials', {
            email,
            password,
            callbackUrl: '/',
          });

          if (result?.error) {
            setError('Registration successful, but login failed. Please try logging in.');
          }
        } else {
          setError(data.message || 'Registration failed');
        }
      } else {
        // Handle login
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl: '/',
        });

        if (result?.error) {
          setError('Invalid email or password');
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen max-w-full">
      <Head>
        <title>Login to Twitter 2.0</title>
        <link rel="icon" href="/assets/twitter-logo.svg" />
      </Head>
      <div className="hidden md:flex flex-col flex-1 bg-lightblue-500 justify-center items-center p-12 lg:p-24">
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

      <div className="flex-1 flex justify-center items-center p-4 sm:p-12 lg:p-24">
        <div>
          <Image src="https://rb.gy/ogau5a" alt="" height={30} width={30} className="text-lightblue-500" />
          <h2 className="text-2xl font-bold">See what's happening in the world right now</h2>
          <h6 className="font-bold">Join Twitter 2.0 today</h6>

          {/* Credential-based authentication form */}
          <form onSubmit={handleCredentialAuth} className="space-y-4 my-6">
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {signUp && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightblue-500 placeholder-gray-400"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightblue-500 placeholder-gray-400"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightblue-500 placeholder-gray-400"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lightblue-500 text-white p-3 rounded-lg hover:bg-lightblue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : (signUp ? 'Sign up' : 'Sign in')}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {Object.values(providers)
            .filter((provider: IProvider) => provider.id !== 'credentials')
            .map((provider: IProvider) => {
              return (
                // Show the animated button with the provider (Google, etc.)
                <div key={provider.name} className="py-3">
                  <AnimatedButton handleAuth={handleAuth} provider={provider} authName={provider.name} signUp={signUp} />
                </div>
              );
            })}

          {!signUp && <div>Don't have an account? <a className="text-lightblue-400 cursor-pointer hover:underline" onClick={() => { setSignUp(true); setError(''); }}>Sign up</a></div>}

          {signUp && <div>Already have an account? <a className="text-lightblue-400 cursor-pointer hover:underline" onClick={() => { setSignUp(false); setError(''); }}>Sign in</a></div>}
        </div>
      </div>
    </div>
  );
};

export default Auth;


export const getServerSideProps = async (context) => {
  const trendingResults = await fetch("https://www.jsonkeeper.com/b/NKEV").then((res) => res.json());

  const followResults = await fetch("https://www.jsonkeeper.com/b/WWMJ").then((res) => res.json());

  const providers = await getProviders();
  const session = await getSession(context);

  return {
    props: {
      trendingResults,
      followResults,
      providers,
      session
    }
  };
};