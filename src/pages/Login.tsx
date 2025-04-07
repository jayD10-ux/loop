
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SupabaseSignInForm } from "@/components/auth/SupabaseSignInForm";

export default function Login() {
  return (
    <AuthLayout>
      <SupabaseSignInForm />
    </AuthLayout>
  );
}
