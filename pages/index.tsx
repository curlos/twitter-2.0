import { useSession } from 'next-auth/react';
import Router from 'next/router';
import { FaFeatherAlt } from 'react-icons/fa';
import { useRecoilState } from 'recoil';
import { newTweetModalState } from '../atoms/atom';
import Feed from '../components/Feed';
import AppLayout from '../components/Layout/AppLayout';


export default function Home() {
  const { data: session } = useSession();
  const [_isNewTweetModalOpen, setIsNewTweetModalOpen] = useRecoilState(newTweetModalState);

  return (
    <AppLayout title="Twitter 2.0">
      <Feed />

      <div className="sm:hidden text-black dark:text-white  bg-lightblue-400 flex justify-center items-center rounded-full p-4 fixed bottom-0 right-0 mr-4 mb-16 cursor-pointer" onClick={() => {
        if (!session) {
          Router.push('/auth');
          return;
        }
        setIsNewTweetModalOpen(true);
      }}>
        <FaFeatherAlt className="h-7 w-7 text-white" />
      </div>
    </AppLayout>
  );
}
