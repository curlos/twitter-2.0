import FollowersOrFollowing from '../../components/FollowersOrFollowing';

/**
 * @description - Renders the FOLLOWERS of the user whose "username" (tag) matches the one in the URL.
 * @returns {React.FC}
 */
const Followers = () => {
  return <FollowersOrFollowing />;
};

export default Followers;

export async function getServerSideProps(context) {
  return { props: {} };
}