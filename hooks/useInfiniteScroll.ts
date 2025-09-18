import { useState, useEffect } from 'react';

interface UseInfiniteScrollProps<T> {
  items: T[];
  itemsPerPage?: number;
  triggerDistance?: number;
}

interface UseInfiniteScrollReturn<T> {
  displayedItems: T[];
  loadingMore: boolean;
  hasMore: boolean;
}

export const useInfiniteScroll = <T>({
  items,
  itemsPerPage = 10,
  triggerDistance = 1000
}: UseInfiniteScrollProps<T>): UseInfiniteScrollReturn<T> => {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Update displayed items when items or page changes
  useEffect(() => {
    const endIndex = page * itemsPerPage;
    setDisplayedItems(items.slice(0, endIndex));
    setLoadingMore(false);
  }, [items, page, itemsPerPage]);

  // Reset pagination only when items length significantly changes
  useEffect(() => {
    const currentLength = items.length;
    const displayedLength = displayedItems.length;

    // Only reset if we have significantly fewer items than displayed
    // This handles cases like filtering/sorting but not minor updates
    if (displayedLength > currentLength) {
      setPage(1);
    }
  }, [items.length]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - triggerDistance) {
        if (displayedItems.length < items.length && !loadingMore) {
          setLoadingMore(true);
          setPage(prevPage => prevPage + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedItems.length, items.length, loadingMore, triggerDistance]);

  const hasMore = displayedItems.length < items.length;

  return {
    displayedItems,
    loadingMore,
    hasMore,
  };
};