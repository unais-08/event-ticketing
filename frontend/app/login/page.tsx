"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser,getMe } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import { Button } from "@/app/_components/ui/button";
import { useAuthStore } from "@/app/_stores/auth-store"; 

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get("next") ?? "/";

  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loginUser(form);

      if (res.data) {
        setSession(res.data);
      } else {
        // backend may use httpOnly cookies and not return token; fetch current user
        const me = await getMe();
        setSession({ user: me.data!.user, token: me.data?.token ?? "" , tokenType: "Bearer", expiresIn: "" });
      }

      router.push(next);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to log in."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required />
        </div>
        <div>
          <Label>Password</Label>
          <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex items-center gap-3">
          <Button disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
    </div>
  );
}
