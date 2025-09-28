import Link from 'next/link';

interface Props {
  text: string,
  Icon: any,
  IconSolid?: any,
  active: boolean,
  tag?: string;
}

/**
 * @description - Renders a sidebar link for the "Sidebar" component.
 * @returns {React.FC}
 */
const SidebarLink = ({ text, Icon, IconSolid, active, tag }: Props) => {

  /**
   * @description - Get the href link. If it's not a page, then it won't redirect anywhere. It'll just do whatever it's function intends it do. For example, clicking the "Search" button will open the search modal and won't link anywhere.
   * @param {String} text - The text that will be displayed.
   * @returns {String}
   */
  const getLinkHref = (text) => {
    switch (text) {
      case 'Profile':
        return `/profile/${tag}`;
      case 'Messages':
        return `/messages`;
      case 'Bookmarks':
        return `/bookmarks`;
      case 'Settings':
        return `/settings`;
      case 'News':
        return '/headlines'
      case 'Login':
        return '/auth'
      case 'Signup':
        return '/auth?sign-up=true'
      default:
        return '/';
    }
  };

  return (
    <Link href={getLinkHref(text)}>
      {/* Show the text as bold when the link is ACTIVE (meaning we are on that page. So, if we were on the user's bookmarks, then the "Bookmark" link would be bold.) */}
      <div className={`flex items-center space-x-2 text-xl cursor-pointer ${active && 'font-bold text-lightblue-500 dark:text-lightblue-500'}`}>
        {active && IconSolid ? (
          <IconSolid className="h-[30px] w-[30px]" />
        ) : (
          <Icon className="h-[30px] w-[30px]" />
        )}
        <div className="hidden xl:block">{text}</div>
      </div>
    </Link>
  );
};

export default SidebarLink;
