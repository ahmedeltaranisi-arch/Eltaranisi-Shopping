export default function LoadingProductDetails() {
  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-8">
          <span className="h-3 w-16 bg-[#E7E5E1] rounded-full animate-pulse" />
          <span className="h-3 w-3 bg-[#E7E5E1] rounded-full animate-pulse" />
          <span className="h-3 w-20 bg-[#E7E5E1] rounded-full animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square bg-[#EDEBE6] border border-[#E7E5E1] rounded-sm animate-pulse" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className="w-16 h-16 bg-[#EDEBE6] border border-[#E7E5E1] rounded-sm animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="h-2.5 w-20 bg-[#E7E5E1] rounded-full animate-pulse" />
            <span className="h-7 w-4/5 bg-[#E7E5E1] rounded-sm animate-pulse" />
            <span className="h-3.5 w-32 bg-[#E7E5E1] rounded-full animate-pulse" />
            <div className="flex flex-col gap-2 mt-2">
              <span className="h-3 w-full bg-[#EDEBE6] rounded-sm animate-pulse" />
              <span className="h-3 w-full bg-[#EDEBE6] rounded-sm animate-pulse" />
              <span className="h-3 w-2/3 bg-[#EDEBE6] rounded-sm animate-pulse" />
            </div>
            <span className="h-9 w-32 bg-[#E7E5E1] rounded-sm animate-pulse mt-2" />
            <div className="pt-6 mt-4 border-t border-[#E7E5E1] flex gap-3">
              <span className="h-12 flex-1 bg-[#E7E5E1] rounded-sm animate-pulse" />
              <span className="h-12 w-12 bg-[#E7E5E1] rounded-sm animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
