const AVATAR_COLORS = [
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-green-100 text-green-600',
  'bg-pink-100 text-pink-600',
  'bg-indigo-100 text-indigo-600',
  'bg-orange-100 text-orange-600',
  'bg-teal-100 text-teal-600',
  'bg-red-100 text-red-600',
  'bg-yellow-100 text-yellow-600',
  'bg-cyan-100 text-cyan-600',
]

const SIZES = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
}

//Turns a name into a consistent index so the same person always gets the same color
function hashNameToIndex(name, paletteLength) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % paletteLength
}

function Avatar({ name, size = 'md' }) {
  //No name means unassigned/unknown, show a neutral placeholder instead of hashing a color
  if (!name) {
    return (
      <div className={`rounded-full flex items-center justify-center font-semibold flex-shrink-0 bg-gray-100 text-gray-400 ${SIZES[size]}`}>
        ?
      </div>
    )
  }

  const colorClass = AVATAR_COLORS[hashNameToIndex(name, AVATAR_COLORS.length)]
  const initial = name.charAt(0).toUpperCase()

  return (
    <div
      className={`rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${SIZES[size]} ${colorClass}`}
    >
      {initial}
    </div>
  )
}

export default Avatar