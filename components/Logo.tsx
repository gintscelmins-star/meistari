import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-xl">PM</span>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-lg leading-none">ProMeistars</span>
        <span className="text-xs text-gray-500">Atrod meistaru Latvijā</span>
      </div>
    </Link>
  )
}
