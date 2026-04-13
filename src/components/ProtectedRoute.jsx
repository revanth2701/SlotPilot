import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-9 h-9 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
  </div>
);

/**
 * ProtectedRoute — renders children only when there is a valid Supabase session.
 * Redirects unauthenticated visitors to `redirectTo` (default: /student-login).
 */
export const ProtectedRoute = ({ children, redirectTo = "/student-login" }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate(redirectTo, { replace: true });
      } else {
        setAllowed(true);
      }
      setChecking(false);
    });
  }, [navigate, redirectTo]);

  if (checking) return <Spinner />;
  return allowed ? children : null;
};

/**
 * AdminRoute — renders children only when there is a valid session AND the
 * authenticated user has a corresponding record in the EmployerData table.
 * Unauthenticated or unauthorised visitors are redirected to /employer-login.
 */
export const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/employer-login", { replace: true });
        setChecking(false);
        return;
      }

      // Confirm the authenticated user is registered as an employer
      const { data: employer } = await supabase
        .from("EmployerData")
        .select('"Registration Id"')
        .eq("Mail Id", session.user.email)
        .maybeSingle();

      if (!employer) {
        // Valid session but not an employer — sign out and redirect
        await supabase.auth.signOut();
        navigate("/employer-login", { replace: true });
        setChecking(false);
        return;
      }

      setAllowed(true);
      setChecking(false);
    };

    verify();
  }, [navigate]);

  if (checking) return <Spinner />;
  return allowed ? children : null;
};
