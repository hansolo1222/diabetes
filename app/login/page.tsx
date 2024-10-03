"use client";

import { useState, useEffect } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from 'next/image';
import GoogleButton from 'react-google-button';
import styled from 'styled-components';

// Create a styled component for the email display
const StyledEmail = styled.span`
  font-weight: 600;
  color: #2563eb;
  margin-left: 0.5rem;
  font-size: 1.1rem;
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");4
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      console.error(result.error);
    } else {
      router.push("/");
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signIn('google', { callbackUrl: '/', redirect: false });
    if (result?.ok) {
      router.push('/');
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      <Image
        src="/background.svg"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-0"
      />
      {session ? (
        <div className="z-10 w-full max-w-md bg-white bg-opacity-95 shadow-md rounded px-60 pt-6 pb-8 mb-4 min-h-1800px flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Quick Diabetes Recommendation</h2>
            <p className="text-center mb-4">
              Logged in as: 
              <StyledEmail>{session.user?.email}</StyledEmail>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="z-10 w-full max-w-md">
          <form onSubmit={handleSubmit} className="bg-white bg-opacity-90 shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="******************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between mb-6">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Sign In
              </button>
              <Link href="/register" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                Don&apos;t have an account? Register
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <GoogleButton onClick={handleGoogleSignIn} />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}