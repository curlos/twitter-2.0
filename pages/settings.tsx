import { useSession } from 'next-auth/react';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { colorThemeState, newTweetModalState, searchModalState, sidenavState } from '../atoms/atom';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import MobileBottomNavBar from '../components/MobileBottomNavBar';
import { NewTweetModal } from '../components/NewTweetModal';
import { SearchModal } from '../components/SearchModal';
import Sidebar from '../components/Sidebar';
import SidenavDrawer from '../components/SidenavDrawer';
import Widgets from '../components/Widgets';
import { SunIcon, MoonIcon, MailIcon, LockClosedIcon, ChevronDownIcon } from '@heroicons/react/outline';

const Settings = () => {
  useAuthRedirect();
  const { data: session, update } = useSession();
  const [isOpen, _setIsOpen] = useRecoilState(newTweetModalState);
  const [theme, setTheme] = useRecoilState(colorThemeState);
  const [isSearchModalOpen, _setIsSearchModalOpen] = useRecoilState(searchModalState);
  const [isSidenavOpen, _setIsSidenavOpen] = useRecoilState(sidenavState);

  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);

  const [isEmailAccordionOpen, setIsEmailAccordionOpen] = useState(false);
  const [isPasswordAccordionOpen, setIsPasswordAccordionOpen] = useState(false);

  useEffect(() => {
    setTheme(localStorage.getItem('theme'));
  }, []);

  useEffect(() => {
    // Check if user has a password (credential users vs OAuth users)
    const checkUserPassword = async () => {
      try {
        const response = await fetch('/api/user/check-password');
        const data = await response.json();
        setHasPassword(data.hasPassword);
      } catch (error) {
        console.error('Error checking user password:', error);
      }
    };

    if (session?.user) {
      checkUserPassword();
    }
  }, [session]);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!newEmail.trim()) {
      setEmailError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (newEmail === session?.user?.email) {
      setEmailError('New email must be different from current email');
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const response = await fetch('/api/user/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.error || 'Failed to update email');
      } else {
        setEmailSuccess('Email updated successfully!');
        setNewEmail('');
        // Update the session to reflect the new email
        await update();
      }
    } catch (error) {
      setEmailError('Network error. Please try again.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || 'Failed to update password');
      } else {
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen min-w-screen`}>
      <Head>
        <title>
          Settings / Twitter 2.0
        </title>
        <link rel="icon" href="/assets/twitter-logo.svg" />
      </Head>

      <main className={`${theme} bg-white text-black dark:bg-black dark:text-white min-h-screen px-0 lg:px-36 xl:px-48 2xl:px-12 flex`}>
        <Sidebar />
        <div className="flex-grow sm:ml-[80px] xl:ml-[280px] text-lg border-r border-[#AAB8C2] dark:border-gray-700">
          <div>
            <div className="flex items-center space-x-4 border-b border-[#AAB8C2] dark:border-gray-700 p-2 bg-white text-black dark:bg-black dark:text-white sticky top-0">
              <div className="">
                <div className="flex items-center mb-0 p-0">
                  <h2 className="font-bold text-xl">Settings</h2>
                </div>
                {session?.user && (
                  <div className="text-gray-400 text-sm">@{session.user.tag}</div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Display</h3>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setTheme('light');
                        localStorage.theme = 'light';
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        theme === 'light'
                          ? 'bg-lightblue-500 text-white border-lightblue-500'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <SunIcon className="h-4 w-4" />
                      <span>Light</span>
                    </button>

                    <button
                      onClick={() => {
                        setTheme('dark');
                        localStorage.theme = 'dark';
                      }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-lightblue-500 text-white border-lightblue-500'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <MoonIcon className="h-4 w-4" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Account</h3>

                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => setIsEmailAccordionOpen(!isEmailAccordionOpen)}
                      className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${
                        isEmailAccordionOpen ? 'rounded-t-lg' : 'rounded-lg'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <MailIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium">Change Email Address</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Update your email address</div>
                        </div>
                      </div>
                      <ChevronDownIcon
                        className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                          isEmailAccordionOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isEmailAccordionOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="pt-4">
                          <div className="mb-4">
                            <div className="text-sm font-medium">Current Email</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <span>{session?.user?.email}</span>
                            </div>
                          </div>

                          <form onSubmit={handleEmailUpdate} className="space-y-4">
                            <div>
                              <label htmlFor="newEmail" className="block text-sm font-medium mb-2">
                                New Email Address
                              </label>
                              <input
                                type="email"
                                id="newEmail"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter new email address"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-lightblue-500 focus:border-transparent"
                                disabled={isUpdatingEmail}
                              />
                            </div>

                            {emailError && (
                              <div className="text-red-500 text-sm">{emailError}</div>
                            )}

                            {emailSuccess && (
                              <div className="text-green-500 text-sm">{emailSuccess}</div>
                            )}

                            <button
                              type="submit"
                              disabled={isUpdatingEmail || !newEmail.trim()}
                              className="px-4 py-2 bg-lightblue-500 text-white rounded-lg hover:bg-lightblue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>

                  {hasPassword && (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <button
                        onClick={() => setIsPasswordAccordionOpen(!isPasswordAccordionOpen)}
                        className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${
                          isPasswordAccordionOpen ? 'rounded-t-lg' : 'rounded-lg'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <LockClosedIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <div className="text-left">
                            <div className="font-medium">Change Password</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Update your account password</div>
                          </div>
                        </div>
                        <ChevronDownIcon
                          className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                            isPasswordAccordionOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isPasswordAccordionOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="pt-4">
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                              <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                                  Current Password
                                </label>
                                <input
                                  type="password"
                                  id="currentPassword"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  placeholder="Enter current password"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-lightblue-500 focus:border-transparent"
                                  disabled={isUpdatingPassword}
                                />
                              </div>

                              <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                                  New Password
                                </label>
                                <input
                                  type="password"
                                  id="newPassword"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  placeholder="Enter new password"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-lightblue-500 focus:border-transparent"
                                  disabled={isUpdatingPassword}
                                />
                              </div>

                              <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                  Confirm New Password
                                </label>
                                <input
                                  type="password"
                                  id="confirmPassword"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="Confirm new password"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-lightblue-500 focus:border-transparent"
                                  disabled={isUpdatingPassword}
                                />
                              </div>

                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number.
                              </div>

                              {passwordError && (
                                <div className="text-red-500 text-sm">{passwordError}</div>
                              )}

                              {passwordSuccess && (
                                <div className="text-green-500 text-sm">{passwordSuccess}</div>
                              )}

                              <button
                                type="submit"
                                disabled={isUpdatingPassword || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
                                className="px-4 py-2 bg-lightblue-500 text-white rounded-lg hover:bg-lightblue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              >
                                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-[60px]" />
          </div>
        </div>

        <Widgets />
        {isOpen && <NewTweetModal />}
        {isSearchModalOpen && <SearchModal />}
        {isSidenavOpen && <SidenavDrawer />}

        <MobileBottomNavBar />
      </main>
    </div>
  );
};

export default Settings;