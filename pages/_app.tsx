import '../styles/globals.css';
import { SessionProvider } from "next-auth/react";
import { RecoilRoot } from 'recoil';
import { useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
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

// Theme wrapper component that can access Recoil state
const ThemeWrapper = ({ children }) => {
  const theme = useRecoilValue(colorThemeState);

  return (
    <div className={theme as string}>
      <div className="bg-white text-black dark:bg-black dark:text-white">
        {children}
      </div>
    </div>
  );
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <RecoilRoot>
        <ThemeInitializer />
        <ThemeWrapper>
          <Component {...pageProps} />
        </ThemeWrapper>
      </RecoilRoot>
    </SessionProvider>
  );
}