import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/solid';
import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useState, Fragment, useRef } from 'react';
import { useRecoilState } from 'recoil';
import { colorThemeState, settingsModalState } from '../atoms/atom';
import { FiCamera } from 'react-icons/fi';
import { db, storage } from '../firebase';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useRouter } from 'next/router';

/**
 * @description - 
 * @returns {React.FC}
 */
const SettingsModal = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useRecoilState(settingsModalState);
  const [name, setName] = useState(session.user.name || '');
  const [tag, setTag] = useState(session.user.tag || '');
  const [bio, setBio] = useState(session.user.bio || '');
  const [usernameTakenError, setUsernameTakenError] = useState(false);
  const [location, setLocation] = useState(session.user.location || '');
  const [website, setWebsite] = useState(session.user.website || '');
  const [banner, setBanner] = useState(session.user.banner || '/assets/profile_banner.jpg');
  const [profilePic, setProfilePic] = useState(session.user.profilePic || '/assets/default_profile_pic.jpg');

  const profilePicFilePickerRef = useRef(null);
  const bannerFilePickerRef = useRef(null);

  const [selectedFileProfilePic, setSelectedFileProfilePic] = useState(null);
  const [selectedFileBanner, setSelectedFileBanner] = useState(null);
  const [theme, setTheme] = useRecoilState(colorThemeState);

  const updateUserProfile = async () => {
    const updatedUserData = {
      name,
      bio,
      location,
      website,
      banner,
      profilePic,
      tag,
      updatedAt: serverTimestamp()
    };

    if (await checkIfUsernameTaken()) {
      setUsernameTakenError(true);
    } else {
      const profilePicRef = ref(storage, `users/profilePic/${session.user.uid}/image`);

      const bannerRef = ref(storage, `users/banner/${session.user.uid}/image`);

      if (selectedFileProfilePic) {
        await uploadString(profilePicRef, selectedFileProfilePic, "data_url").then(async () => {
          const downloadURL = await getDownloadURL(profilePicRef);
          updatedUserData.profilePic = downloadURL;
        });
      }

      if (selectedFileBanner) {
        await uploadString(bannerRef, selectedFileBanner, "data_url").then(async () => {
          const downloadURL = await getDownloadURL(bannerRef);
          updatedUserData.banner = downloadURL;
        });
      }

      await updateDoc(doc(db, "users", session.user.uid), {
        ...updatedUserData,
      });

      session.user.name = name;
      session.user.tag = tag;
      session.user.bio = bio;
      session.user.location = location;
      session.user.website = website;
      session.user.profilePic = profilePic;
      session.user.banner = banner;

      setIsOpen(false);
      router.push(`/profile/${tag}`).then(() => (
        window.location.reload()
      ));
    }
  };

  const checkIfUsernameTaken = async () => {
    if (session.user.tag === tag) {
      return false;
    } else {
      const qUser = query(collection(db, "users"), where('tag', '==', tag));
      const qUserSnap = await getDocs(qUser);
      const usernameTaken = qUserSnap.docs.length > 0;

      return usernameTaken;
    }
  };

  const changeProfilePic = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => [
      setSelectedFileProfilePic(readerEvent.target.result)
    ];
  };

  const changeBannerPic = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => [
      setSelectedFileBanner(readerEvent.target.result)
    ];
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={(val) => {
        setIsOpen(val);
      }}>
        <div className={`${theme} flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0`}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white dark:bg-black rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-top w-[90vw] lg:w-[50vw]">
              <div className="bg-white dark:bg-black p-3 border-b border-[#AAB8C2] dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XIcon className="h-6 w-6 cursor-pointer text-gray-400 dark:text-white" onClick={(val) => {
                      setIsOpen(false);
                    }} />

                    <div className="ml-4 text-xl font-bold">Edit Profile</div>
                  </div>

                  <div className="bg-white text-black font-bold px-5 py-2 rounded-full cursor-pointer" onClick={updateUserProfile}>Save</div>
                </div>
              </div>

              <div className="h-[70vh] overflow-y-scroll">

                <div className="">
                  <div className="w-full rounded-full cursor-pointer" onClick={() => bannerFilePickerRef.current.click()}>
                    <img src={selectedFileBanner || banner} className="w-full max-h-[240px] object-cover" />

                    <FiCamera className="h-5 w-5 ml-[50%] mt-[-125px] z-50" />

                    <input
                      type="file"
                      ref={bannerFilePickerRef}
                      hidden
                      onChange={changeBannerPic}
                    />
                  </div>

                  <div className="mt-[120px]">

                  </div>

                  <div className="mt-[-70px] h-[112px] w-[112px] ml-2 rounded-full cursor-pointer" onClick={() => profilePicFilePickerRef.current.click()}>
                    <img src={selectedFileProfilePic || profilePic} alt={name} className="h-[112px] w-[112px] object-cover rounded-full ml-2 border-4 border-transparent" />

                    <FiCamera className="h-5 w-5 ml-[53px] mt-[-67px] z-50" />

                    <input
                      type="file"
                      ref={profilePicFilePickerRef}
                      hidden
                      onChange={changeProfilePic}
                    />
                  </div>


                </div>

                <div className="p-3 space-y-4">
                  <div className="p-2 border border-[#AAB8C2] dark:border-gray-700 space-y-1 rounded">
                    <div className="text-sm text-gray-400 flex justify-between">
                      <div>Name</div>
                      <div>{name.length} / 50</div>
                    </div>
                    <input className="bg-white text-black dark:text-white dark:bg-black rounded w-full focus:outline-none" value={name} onChange={(e) => {
                      if (e.target.value.length <= 50) {
                        setName(e.target.value);
                      }
                    }
                    }></input>
                  </div>

                  <div className="p-2 border border-[#AAB8C2] dark:border-gray-700 space-y-1 rounded">
                    <div className="text-sm text-gray-400 flex justify-between">
                      <div>Username</div>
                      <div>{tag.length} / 15</div>
                    </div>
                    <input className="bg-white text-black dark:text-white dark:bg-black rounded w-full focus:outline-none" value={tag} onChange={(e) => {
                      if (e.target.value.length <= 15) {
                        setTag(e.target.value);
                      }
                    }
                    }></input>
                  </div>

                  <div className="p-2 border border-[#AAB8C2] dark:border-gray-700 space-y-1 rounded">
                    <div className="text-sm text-gray-400 flex justify-between">
                      <div>Bio</div>
                      <div>{bio.length} / 160</div>
                    </div>
                    <textarea className="w-full bg-white text-black dark:text-white dark:bg-black focus:outline-none resize-none" value={bio} onChange={(e) => {
                      if (e.target.value.length <= 160) {
                        setBio(e.target.value);
                      }
                    }
                    }></textarea>
                  </div>

                  <div className="p-2 border border-[#AAB8C2]  dark:border-gray-700 space-y-1 rounded">
                    <div className="text-sm text-gray-400 flex justify-between">
                      <div>Location</div>
                      <div>{location.length} / 30</div>
                    </div>
                    <input className="bg-white text-black dark:text-white dark:bg-black rounded w-full focus:outline-none" value={location} onChange={(e) => {
                      if (e.target.value.length <= 30) {
                        setLocation(e.target.value);
                      }
                    }
                    }></input>
                  </div>

                  <div className="p-2 border border-[#AAB8C2] dark:border-gray-700 space-y-1 rounded">
                    <div className="text-sm text-gray-400 flex justify-between">
                      <div>Website</div>
                      <div>{website.length} / 100</div>
                    </div>
                    <input className="bg-white text-black dark:text-white dark:bg-black rounded w-full focus:outline-none" value={website} onChange={(e) => {
                      if (e.target.value.length <= 100) {
                        setWebsite(e.target.value);
                      }
                    }}></input>
                  </div>
                </div>

              </div>

              <div className="p-5" />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SettingsModal;
