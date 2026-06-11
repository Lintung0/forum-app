import LoginForm from "@/features/auth/components/LoginForm";



export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f2937] via-[#283548] to-[#1e293b] flex items-center justify-center px-4 py-6">
      <div className="bg-[#162032]/95 backdrop-blur-md border border-blue-400/40 shadow-2xl rounded-3xl w-full max-w-md"
        style={{boxShadow: '0 0 30px rgba(96, 165, 250, 0.3), 0 0 60px rgba(96, 165, 250, 0.1)'}}>
        
        <div className="flex flex-col pt-5 pb-1 px-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              ForumX
            </span>
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight text-center w-full mb-2">Masuk</h1>
        </div>

        <div className="px-8 pb-6 pt-1">
          <LoginForm />
        </div>

      </div>
    </div>
  )
}