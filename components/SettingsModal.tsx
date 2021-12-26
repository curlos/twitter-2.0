import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/solid'
import { onSnapshot } from 'firebase/firestore'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState, Fragment } from 'react'
import { useRecoilState } from 'recoil'
import { settingsModalState } from '../atoms/atom'

const SettingsModal = () => {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(settingsModalState)
  const [name, setName] = useState(session.user.name || '')
  const [bio, setBio] = useState(session.user.bio || '')
  const [location, setLocation] = useState(session.user.location || '')
  const [website, setWebsite] = useState(session.user.website || '')

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={(val) => {
        setIsOpen(val)
      }}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
            <div className="inline-block align-bottom bg-black rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-top w-[50vw]">
              <div className="bg-black p-3 border-b border-gray-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XIcon className="h-6 w-6 cursor-pointer" onClick={(val) => {
                      setIsOpen(false)
                    }} />

                    <div className="ml-4 text-xl font-bold">Edit Profile</div>
                  </div>

                  <div className="bg-white text-black font-bold px-5 py-2 rounded-full">Save</div>
                </div>
              </div>

              <div className="p-3 h-[70vh] overflow-y-scroll space-y-4">

                <div className="p-2 border border-gray-500 space-y-1 rounded">
                  <div className="text-sm text-gray-400 flex justify-between">
                    <div>Name</div>
                    <div>{name.length} / 50</div>
                  </div>
                  <input className="bg-black rounded w-full focus:outline-none" value={name} onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setName(e.target.value)
                    }
                  }
                  }></input>
                </div>

                <div className="p-2 border border-gray-500 space-y-1 rounded">
                  <div className="text-sm text-gray-400 flex justify-between">
                    <div>Bio</div>
                    <div>{bio.length} / 160</div>
                  </div>
                  <textarea className="w-full bg-black focus:outline-none resize-none" value={bio} onChange={(e) => {
                    if (e.target.value.length <= 160) {
                      setBio(e.target.value)
                    }
                  }
                  }></textarea>
                </div>

                <div className="p-2 border border-gray-500 space-y-1 rounded">
                  <div className="text-sm text-gray-400 flex justify-between">
                    <div>Location</div>
                    <div>{location.length} / 30</div>
                  </div>
                  <input className="bg-black rounded w-full focus:outline-none" value={location} onChange={(e) => {
                    if (e.target.value.length <= 30) {
                      setLocation(e.target.value)
                    }
                  }
                  }></input>
                </div>

                <div className="p-2 border border-gray-500 space-y-1 rounded">
                  <div className="text-sm text-gray-400 flex justify-between">
                    <div>Website</div>
                    <div>{website.length} / 100</div>
                  </div>
                  <input className="bg-black rounded w-full focus:outline-none" value={website} onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      setWebsite(e.target.value)
                    }
                  }}></input>
                </div>

              </div>

              <div className="p-5" />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default SettingsModal
