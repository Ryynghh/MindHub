import { SignupForm } from "@/components/signup-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center text-sm font-medium text-neutral-500 hover:text-white transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
