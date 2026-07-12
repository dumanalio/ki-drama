"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { adminLoginSchema } from "@/lib/validation/admin-login";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const parsed = adminLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      setFormError(
        "E-Mail oder Passwort ist falsch. Bitte versuche es erneut."
      );
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {formError ? (
        <p
          role="alert"
          className="bg-danger-soft text-danger rounded-lg px-4 py-3 text-[14px]"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-email"
          className="text-ink text-[14px] font-medium"
        >
          E-Mail
        </label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email ? (
          <span className="text-danger text-[13px]">{fieldErrors.email}</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="admin-password"
          className="text-ink text-[14px] font-medium"
        >
          Passwort
        </label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password ? (
          <span className="text-danger text-[13px]">
            {fieldErrors.password}
          </span>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={submitting}
        className="mt-2"
      >
        Anmelden
      </Button>
    </form>
  );
}
