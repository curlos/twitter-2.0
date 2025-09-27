import '../styles/globals.css';
import { SessionProvider } from "next-auth/react";
import { RecoilRoot } from 'recoil';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { colorThemeState } from '../atoms/atom';

// Component to initialize theme from localStorage
const ThemeInitializer = () => {
  const setTheme = useSetRecoilState(colorThemeState);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (!storedTheme) {
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    } else {
      setTheme(storedTheme);
    }
  }, [setTheme]);

  return null;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <RecoilRoot>
        <ThemeInitializer />
        <Component {...pageProps} />
      </RecoilRoot>
    </SessionProvider>
  );
}