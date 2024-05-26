import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useRef } from 'react'
import { Close } from '../../libs/icons/src/lib/icons'

export interface IModal {
  open: boolean
  setOpen: (value: boolean) => void
  content: React.ReactNode
  className?: string
}

const Modal = ({ open, setOpen, content, className }: IModal) => {
  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-700"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-700"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative rounded-2xl p-2 bg-white dark:bg-dark-primary-900 shadow-xl">
                <div className="w-full flex items-center justify-end">
                  <Close
                    className="scale-[50%] cursor-pointer"
                    onClick={() => setOpen(false)}
                  />
                </div>
                <div
                  className={`overflow-y-auto text-xs transform rounded-2xl text-left transition-all sm:my-8 w-full h-[650px] w-[550px] max-w-xl lg:max-w-[650px] lg:max-h-[594px] ${
                    className ?? ''
                  }`}
                >
                  {content}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
export default Modal
