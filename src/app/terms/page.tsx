export default function TermsPage() {
  return (
    <div className="page-transition max-w-3xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
      <div className="prose prose-invert max-w-none">
        <h1 className="font-display text-4xl font-semibold text-[#1a1a1a] mb-8">Terms of Service</h1>
        
        <p className="text-[#5a5a5a]">Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="text-[#5a5a5a]">
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">2. Community Guidelines</h2>
        <p className="text-[#5a5a5a]">
          To ensure fair rankings, you agree to:
        </p>
        <ul className="list-disc pl-5 text-[#5a5a5a] space-y-2">
          <li>Provide accurate ratings based on gameplay experience.</li>
          <li>Not manipulate the ranking system through multiple accounts or coordinated voting.</li>
          <li>Respect other community members.</li>
        </ul>

        <h2 className="text-xl font-medium text-[#1a1a1a] mt-8 mb-4">3. Account Termination</h2>
        <p className="text-[#5a5a5a]">
          We reserve the right to terminate or suspend your access to the ranking system immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </div>
    </div>
  )
}


