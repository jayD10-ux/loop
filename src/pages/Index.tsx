import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Skip onboarding check and always navigate to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    };
    
    checkSession();
  }, [navigate]);
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;
