/* eslint-disable react/jsx-no-undef */
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from 'next/image';
import { translations} from '../translations';
import StripeWrapper from '../components/StripeWrapper';

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';


type FoodTranslations = {
  [language: string]: {
    [food: string]: string;
  };
};

const foodTranslations: FoodTranslations = {
  en: {
    "Apple": "Apple",
    "Chicken": "Chicken",
    "Broccoli": "Broccoli",
    "Salmon": "Salmon",
    "Avocado": "Avocado",
    "Sweet Potato": "Sweet Potato",
    "Greek Yogurt": "Greek Yogurt",
    "Almonds": "Almonds",
    "Quinoa": "Quinoa"
  },
  zh: {
    "Apple": "苹果",
    "Chicken": "鸡肉",
    "Broccoli": "西兰花",
    "Salmon": "三文鱼",
    "Avocado": "牛油果",
    "Sweet Potato": "红薯",
    "Greek Yogurt": "希腊酸奶",
    "Almonds": "杏仁",
    "Quinoa": "藜麦"
  }
};



export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // States
  const [diabetesType, setDiabetesType] = useState("2");
  const [claudeOutput, setClaudeOutput] = useState("");
  const [food, setFood] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [hasPaid, setHasPaid] = useState(false);
  const t = translations[language];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // Redirects to login if not authenticated
    }
  }, [status, router]);

  const checkPaymentStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/check-payment');
      const data = await response.json();
      setHasPaid(data.hasPaid);
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      checkPaymentStatus();
    }
  }, [status, session, checkPaymentStatus]);

  // After successful payment
  const handlePaymentSuccess = useCallback(async () => {
    try {
      await fetch('/api/update-payment-status', { method: 'POST' });
      setHasPaid(true);
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  }, []);

  // Pass this to your StripeWrapper component
  // <StripeWrapper onSuccess={handlePaymentSuccess} />

  // Show loading state if session is loading
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // If authenticated, show the content
  if (status === "authenticated") {

    const popularFoods = [
      "Apple", "Chicken", "Broccoli",
      "Salmon", "Avocado", "Sweet Potato",
      "Greek Yogurt", "Almonds", "Quinoa",
    ];

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const prompt = `Can a person with Type ${diabetesType} diabetes eat ${food} without raising blood sugar? Please be concise and respond in no more than 3 sentences.`;
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, language }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setClaudeOutput(data.claudeOutput);
      } catch (error) {
        console.error("Error:", error);
        setClaudeOutput("An error occurred while fetching the recommendation.");
      } finally {
        setIsLoading(false);
      }
    };

    const handlePopularFoodClick = (popularFood: string) => {
      setFood(popularFood);
    };

    const toggleLanguage = () => {
      setLanguage((prev) => (prev === 'en' ? 'zh' : 'en'));
    };

    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12">
        <Image
          src="/background.svg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="z-0"
        />

        <div className="relative z-10 w-full max-w-3xl bg-white bg-opacity-95 p-6 md:p-8 lg:p-10 rounded-lg shadow-lg">
          <div className="absolute top-4 right-4 flex items-center space-x-4">
            <span className="text-sm">
              {session.user?.email}
            </span>
            <Link href="/api/auth/signout" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Sign Out
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">{t.title}</h1>

          {!hasPaid ? (
            // eslint-disable-next-line react/jsx-no-undef
            <StripeWrapper onSuccess={handlePaymentSuccess} />
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-wrap items-center justify-center space-x-2 text-sm md:text-base lg:text-lg">
                  <span className="whitespace-nowrap text-gray-700">{t.type}</span>
                  <select
                    value={diabetesType}
                    onChange={(e) => setDiabetesType(e.target.value)}
                    className="border rounded p-1 bg-yellow-100"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                  <span className="whitespace-nowrap text-gray-700">{t.diabetes}</span>
                  <input
                    type="text"
                    value={food}
                    onChange={(e) => setFood(e.target.value)}
                    className="w-24 md:w-32 border rounded p-1 bg-yellow-100"
                    placeholder={language === 'en' ? "Enter a food" : "输入食物"}
                    required
                  />
                  <span className="whitespace-nowrap text-gray-700">{t.without}</span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-400 text-white py-2 rounded hover:bg-orange-500 transition duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? t.loading : t.findOut}
                </button>
              </form>

              {claudeOutput && (
                <div className="mt-4 p-4 bg-yellow-100 bg-opacity-95 rounded">
                  <p dangerouslySetInnerHTML={{ __html: claudeOutput }}></p>
                </div>
              )}

              <div className="mt-8">
                <h3 className="font-semibold mb-4 text-gray-700">{t.popularFood}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {popularFoods.map((popularFood, index) => (
                    <button
                      key={index}
                      className="bg-yellow-100 p-4 rounded text-center hover:bg-yellow-200 transition duration-300"
                      onClick={() => handlePopularFoodClick(popularFood)}
                    >
                      {foodTranslations[language][popularFood]}
                    </button>
                  ))}
                </div>
                <p className="mt-8 text-sm text-gray-500 text-center">
                  {t.disclaimer}
                </p>
              </div>

              <div className="tree-container">
                <ul className="tree">
                  <li>
                    <span>120</span>
                    <ul>
                      <li>
                        <span>12</span>
                        <ul>
                          <li><span>4</span>
                            <ul>
                              <li><span>2</span></li>
                              <li><span>2</span></li>
                            </ul>
                          </li>
                          <li><span>3</span></li>
                        </ul>
                      </li>
                      <li>
                        <span>10</span>
                        <ul>
                          <li><span>5</span></li>
                          <li><span>2</span></li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }
  
  // If the user is not authenticated (although they should be redirected), you could also return null or an empty div
  return null;
}
