import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

interface UseDebounceSearchOptions {
  delay?: number;
  onSearch?: () => void;
}

export const useDebounceSearch = (options: UseDebounceSearchOptions = {}) => {
  const { delay = 1000, onSearch } = options;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const isUserInitiated = useRef(false);

  useEffect(() => {
    isUserInitiated.current = false;
    if (router.query && router.query.query && typeof router.query.query === 'string') {
      setSearchQuery(router.query.query);
    } else {
      setSearchQuery('');
    }
  }, [router.query.query]);

  useEffect(() => {
    if (!isUserInitiated.current) return;

    const timeoutId = setTimeout(() => {
      if (searchQuery === '') {
        router.push('/');
      } else {
        router.push(`/?query=${searchQuery}`);
      }
      onSearch?.();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, delay, router, onSearch]);

  const handleSearchChange = (value: string) => {
    isUserInitiated.current = true;
    setSearchQuery(value);
  };

  return {
    searchQuery,
    setSearchQuery: handleSearchChange,
  };
};