const SkeletonCard = () => {
  return (
    <div className="card-gradient rounded-xl p-6 border border-white/10 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-8 w-20 bg-gray-700 rounded-full"></div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6"></div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-16 bg-gray-700 rounded"></div>
          <div className="h-4 w-24 bg-gray-700 rounded"></div>
        </div>
        <div className="h-9 w-24 bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  )
}

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

export const SkeletonChart = () => {
  return (
    <div className="card-gradient rounded-xl p-6 border border-white/10 animate-pulse">
      <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-gray-700 rounded"></div>
    </div>
  )
}

export default SkeletonCard
