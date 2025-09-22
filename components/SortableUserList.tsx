import React, { useState, useMemo, useEffect } from 'react';
import { sortByNewestFollowers, sortByOldestFollowers, sortByMostFollowers, sortByMostFollowing } from '../utils/sortUsers';
import { SortDropdown } from './SortDropdown';
import InfiniteScroll from './InfiniteScroll';
import MediumUser from './MediumUser';
import MediumUserSkeletonLoader from './MediumUserSkeletonLoader';

interface SortableUserListProps {
  users: any[];
  loading?: boolean;
  emptyStateMessage?: string;
  emptyStateSubtitle?: string;
  emptyStateIcon?: React.ComponentType<any>;
  customRenderItem?: (user: any) => React.ReactNode;
  itemsPerPage?: number;
  className?: string;
  showFollowerSortOptions?: boolean; // New prop to control which sort options to show
}

const SortableUserList = ({
  users,
  loading = false,
  emptyStateMessage = 'No Users',
  emptyStateSubtitle = 'When there are users, they\'ll show up here.',
  emptyStateIcon: EmptyIcon,
  customRenderItem,
  itemsPerPage = 10,
  className = '',
  showFollowerSortOptions = false
}: SortableUserListProps) => {
  const [sortType, setSortType] = useState(showFollowerSortOptions ? 'Newest Followers' : 'No Sorting');
  const [filteredUsers, setFilteredUsers] = useState([]);

  const getSortedUsers = (usersToSort: any[]) => {
    switch (sortType) {
      case 'Newest Followers':
        return sortByNewestFollowers(usersToSort);
      case 'Oldest Followers':
        return sortByOldestFollowers(usersToSort);
      case 'Most Followers':
        return sortByMostFollowers(usersToSort);
      case 'Most Following':
        return sortByMostFollowing(usersToSort);
      case 'No Sorting':
        return usersToSort; // Return original order without sorting
      default:
        return showFollowerSortOptions ? sortByNewestFollowers(usersToSort) : usersToSort;
    }
  };

  const sortedUserIds = useMemo(() => {
    const sorted = getSortedUsers(users);
    return sorted.map(user => user.id);
  }, [users.length, sortType]);

  const optimizedSortedUsers = useMemo(() => {
    const userMap = new Map(users.map(user => [user.id, user]));
    return sortedUserIds.map(id => userMap.get(id)).filter(Boolean);
  }, [users, sortedUserIds]);

  useEffect(() => {
    setFilteredUsers(optimizedSortedUsers);
  }, [optimizedSortedUsers]);

  const defaultRenderItem = (user: any) => (
    <MediumUser
      key={user.id}
      userID={user.id}
      user={user.userData}
    />
  );

  const renderItem = customRenderItem || defaultRenderItem;

  if (loading) {
    return (
      <div className={className}>
        {Array.from({ length: itemsPerPage }, (_, index) => (
          <MediumUserSkeletonLoader key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {showFollowerSortOptions && (
        <div className="mb-4">
          <SortDropdown
            sortType={sortType}
            setSortType={setSortType}
            options={['Newest Followers', 'Oldest Followers', 'Most Followers', 'Most Following']}
          />
        </div>
      )}

      {filteredUsers.length > 0 ? (
        <InfiniteScroll
          items={filteredUsers}
          renderItem={renderItem}
          itemsPerPage={itemsPerPage}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          {EmptyIcon && <EmptyIcon className="h-12 w-12 mb-4" />}
          <p className="text-xl font-semibold">{emptyStateMessage}</p>
          <p className="text-gray-400 mt-2">{emptyStateSubtitle}</p>
        </div>
      )}

      <div className="h-[60px]" />
    </div>
  );
};

export default SortableUserList;