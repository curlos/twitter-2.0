import FollowersOrFollowing from '../../components/FollowersOrFollowing';

/**
 * @description - Renders the accounts following the user whose "username" (tag) matches the one in the URL.
 * @returns {React.FC}
 */
const Following = () => {
  return <FollowersOrFollowing />;
};

export default Following;

export async function getServerSideProps(context) {
  return { props: {} };
}