"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { registerUser, getMe } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import { Button } from "@/app/_components/ui/button";
import { useAuthStore } from "@/app/_stores/auth-store";
import { getRoleHomePath } from "@/app/_lib/roles";

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await registerUser(form);

      if (res.data) {
        setSession(res.data);
      } else {
        const me = await getMe();
        setSession({ user: me.data!.user, token: "", tokenType: "Bearer", expiresIn: "" });
      }

      router.push(getRoleHomePath(res.data?.user.role ?? undefined));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create an account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
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
            {loading ? "Creating…" : "Create account"}
          </Button>
        </div>
      </form>
    </div>
  );
}
