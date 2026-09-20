export default function LoadingProducts() {
  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between border-b border-[#E7E5E1] pb-6 mb-8">
          <div>
            <span className="block h-2.5 w-24 bg-[#E7E5E1] rounded-full animate-pulse" />
            <span className="mt-3 block h-8 w-48 bg-[#E7E5E1] rounded-sm animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col bg-white border border-[#E7E5E1] rounded-sm overflow-hidden"
            >
              <div className="relative w-full h-52 bg-[#EDEBE6] animate-pulse" />
              <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
                <span className="h-2 w-16 bg-[#E7E5E1] rounded-full animate-pulse" />
                <span className="h-3.5 w-3/4 bg-[#E7E5E1] rounded-sm animate-pulse" />
                <span className="h-3 w-full bg-[#EDEBE6] rounded-sm animate-pulse" />
                <span className="h-3 w-2/3 bg-[#EDEBE6] rounded-sm animate-pulse" />
                <div className="mt-2 flex items-center justify-between">
                  <span className="h-4 w-14 bg-[#E7E5E1] rounded-sm animate-pulse" />
                  <span className="h-4 w-10 bg-[#E7E5E1] rounded-sm animate-pulse" />
                </div>
              </div>
              <span className="block w-full h-10 bg-[#EDEBE6] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
