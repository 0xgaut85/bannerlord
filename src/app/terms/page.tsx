export default function TermsPage() {
  return (
    <div className="page-transition max-w-3xl mx-auto px-6 lg:px-8 py-12 sm:py-16 animate-fade-up">
      <div className="prose prose-invert max-w-none">
        <h1 className="font-display text-4xl font-bold text-white mb-8">Terms of Service</h1>
        
        <p className="text-[#888]">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-xl font-medium text-white mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="text-[#888]">
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2 className="text-xl font-medium text-white mt-8 mb-4">2. Community Guidelines</h2>
        <p className="text-[#888]">
          To ensure fair rankings, you agree to:
        </p>
        <ul className="list-disc pl-5 text-[#888] space-y-2">
          <li>Provide accurate ratings based on gameplay experience.</li>
          <li>Not manipulate the ranking system through multiple accounts or coordinated voting.</li>
          <li>Respect other community members.</li>
        </ul>

        <h2 className="text-xl font-medium text-white mt-8 mb-4">3. Account Termination</h2>
        <p className="text-[#888]">
          We reserve the right to terminate or suspend your access to the ranking system immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </div>
    </div>
  )
}
