
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SupabaseSignUpForm } from "@/components/auth/SupabaseSignUpForm";

export default function Signup() {
  return (
    <AuthLayout>
      <SupabaseSignUpForm />
    </AuthLayout>
  );
}
