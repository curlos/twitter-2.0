import React from 'react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import Spinner from './Spinner';

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemsPerPage?: number;
  triggerDistance?: number;
  loading?: boolean;
  LoadingComponent?: React.ComponentType;
  className?: string;
}

const InfiniteScroll = <T,>({
  items,
  renderItem,
  itemsPerPage = 10,
  triggerDistance = 1000,
  loading = false,
  LoadingComponent,
  className = ''
}: InfiniteScrollProps<T>) => {
  const {
    displayedItems,
    loadingMore,
    hasMore
  } = useInfiniteScroll({
    items,
    itemsPerPage,
    triggerDistance
  });

  if (loading && LoadingComponent) {
    return <LoadingComponent />;
  }

  return (
    <div className={className}>
      {displayedItems.map((item, index) => (
        <React.Fragment key={index}>
          {renderItem(item, index)}
        </React.Fragment>
      ))}

      {/* Show loading spinner when loading more items */}
      {!loading && hasMore && loadingMore && (
        <div className="py-4">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;