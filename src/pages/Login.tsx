import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SupabaseSignInForm } from "@/components/auth/SupabaseSignInForm";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // If user is already logged in, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <AuthLayout>
      <SupabaseSignInForm />
    </AuthLayout>
  );
}
