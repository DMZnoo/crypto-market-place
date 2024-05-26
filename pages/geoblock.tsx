import { GeoLock } from '@/libs/icons/src/lib/icons'

export default function Index({}) {
  return (
    <main className="flex flex-col items-center justify-center m-auto grow h-screen">
      <GeoLock />
      <h1 className="text-xl sm:text-xl dark:text-white text-black font-bold mt-8">
        Oops this app does not support users from your country. Sorry for the
        inconvenience!
      </h1>
    </main>
  )
}
