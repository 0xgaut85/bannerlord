export default function PrivacyPage() {
  return (
    <div className="page-transition max-w-3xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
      <div className="prose prose-invert max-w-none">
        <h1 className="font-display text-4xl font-semibold text-[#1a1a1a] mb-8">Privacy Policy</h1>
        
        <p className="text-[#5a5a5a]">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">1. Information We Collect</h2>
        <p className="text-[#5a5a5a]">
          When you sign in with Discord, we collect your Discord User ID to link your account. 
          We do not access or store your Discord messages, friends, or other private data.
          You voluntarily provide your in-game name, clan, and division during the onboarding process.
        </p>

        <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">2. How We Use Your Information</h2>
        <p className="text-[#5a5a5a]">
          We use your information solely to:
        </p>
        <ul className="list-disc pl-5 text-[#5a5a5a] space-y-2">
          <li>Authenticate your identity to prevent vote manipulation.</li>
          <li>Display your in-game identity alongside your ratings.</li>
          <li>Calculate vote weights based on your division.</li>
        </ul>

        <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">3. Data Security</h2>
        <p className="text-[#5a5a5a]">
          We implement appropriate security measures to protect your personal information. 
          Your session data is encrypted, and we do not share your data with third parties.
        </p>
      </div>
    </div>
  )
}


