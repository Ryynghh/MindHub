import { LoginForm } from "@/components/login-form";
import { FloatingHeader } from "@/components/layouts/floating-header";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* <FloatingHeader /> */}
        <LoginForm />
      </div>
    </div>
  );
}
