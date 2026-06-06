"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, getMe } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import { Button } from "@/app/_components/ui/button";
import { useAuthStore } from "@/app/_stores/auth-store";
import { getRoleHomePath } from "@/app/_lib/roles";
import { Role } from "../../_lib/types";
import SampleCredentials from "@/app/_components/auth/sample-credentials";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") ?? "";

  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const res = await loginUser(form);

      let role: string | undefined;

      if (res.data) {
        setSession(res.data);
        role = res.data.user.role;
      } else {
        const me = await getMe();

        if (!me.data?.user) {
          throw new Error("Unable to fetch user.");
        }

        setSession({
          user: me.data.user,
          token: "",
          tokenType: "Bearer",
          expiresIn: "",
        });

        role = me.data.user.role;
      }

      router.push(next || getRoleHomePath(role as Role));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to log in."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="mb-6 text-2xl font-semibold">
        Log in
      </h1>


      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            type="password"
            required
            value={form.password}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
      {/* sample credentials */}
      <SampleCredentials />

    </div>
  );
}