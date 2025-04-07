
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Loader2 } from "lucide-react";

export function SupabaseSignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Error creating account",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data?.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
            account_type: 'individual',
            has_completed_onboarding: false,
          });
          
        if (profileError) {
          console.error("Error creating profile:", profileError);
          // We don't return here as the auth signup was successful
        }
        
        toast({
          title: "Account created!",
          description: "You've successfully created an account.",
        });
        
        // Redirect to onboarding
        navigate("/onboarding");
      }
    } catch (err: any) {
      console.error("Unexpected error during sign up:", err);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Error creating account",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground">Enter your information to get started</p>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive text-destructive p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error creating account</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : "Sign up"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button variant="link" className="h-auto p-0" asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
