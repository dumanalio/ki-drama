"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AnswerCard } from "@/components/check/answer-card";
import { ProgressBar } from "@/components/check/progress-bar";
import {
  TurnstileWidget,
  type TurnstileHandle,
} from "@/components/check/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { checkContactSchema } from "@/lib/validation/check";
import type { QuizQuestion } from "@/types/database";

type Segment = "privat" | "business";
type Answers = Record<string, string | string[]>;
type ContactState = {
  name: string;
  email: string;
  company: string;
  consent: boolean;
};

interface StoredState {
  sessionId: string;
  segment: Segment | null;
  answers: Answers;
  contact: ContactState;
  stepIndex: number;
}

const STORAGE_KEY = "ki-drama-check-v1";

type Step =
  | { kind: "segment" }
  | { kind: "question"; question: QuizQuestion }
  | { kind: "contact" };

function toggleMultiAnswer(
  current: string | string[] | undefined,
  value: string
): string[] {
  const list = Array.isArray(current) ? current : [];
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function QuestionStep({
  question,
  answer,
  onSelectSingle,
  onToggleMulti,
  onTextChange,
  onNext,
}: {
  question: QuizQuestion;
  answer: string | string[] | undefined;
  onSelectSingle: (value: string) => void;
  onToggleMulti: (value: string) => void;
  onTextChange: (value: string) => void;
  onNext: () => void;
}) {
  const selectedValues = Array.isArray(answer)
    ? answer
    : answer
      ? [answer]
      : [];
  const hasAnswer =
    selectedValues.length > 0 ||
    (typeof answer === "string" && answer.trim().length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
          {question.title}
        </h1>
        {question.hint ? (
          <p className="text-ink-muted text-[15px]">{question.hint}</p>
        ) : null}
      </div>

      {question.type === "text" ? (
        <div className="flex flex-col gap-4">
          <Input
            value={typeof answer === "string" ? answer : ""}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Deine Antwort"
          />
          <Button
            variant="primary"
            onClick={onNext}
            disabled={question.required && !hasAnswer}
            className="self-end"
          >
            Weiter
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((option, index) => (
              <AnswerCard
                key={option.value}
                label={option.label}
                description={option.description}
                selected={selectedValues.includes(option.value)}
                multi={question.type === "multi"}
                shortcutNumber={index + 1}
                onSelect={() =>
                  question.type === "multi"
                    ? onToggleMulti(option.value)
                    : onSelectSingle(option.value)
                }
              />
            ))}
          </div>
          {question.type === "multi" ? (
            <Button
              variant="primary"
              onClick={onNext}
              disabled={question.required && !hasAnswer}
              className="self-end"
            >
              Weiter
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function CheckFunnel({ questions }: { questions: QuizQuestion[] }) {
  const router = useRouter();
  const turnstileRef = React.useRef<TurnstileHandle>(null);

  const [hydrated, setHydrated] = React.useState(false);
  const [sessionId, setSessionId] = React.useState("");
  const [segment, setSegment] = React.useState<Segment | null>(null);
  const [answers, setAnswers] = React.useState<Answers>({});
  const [stepIndex, setStepIndex] = React.useState(0);
  const [contact, setContact] = React.useState<ContactState>({
    name: "",
    email: "",
    company: "",
    consent: false,
  });
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {}
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let saved: Partial<StoredState> = {};
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {
      // Beschädigter Speicher — einfach frisch starten.
    }
    setSessionId(saved.sessionId ?? crypto.randomUUID());
    if (saved.segment) setSegment(saved.segment);
    if (saved.answers) setAnswers(saved.answers);
    if (saved.contact) setContact(saved.contact);
    if (typeof saved.stepIndex === "number") setStepIndex(saved.stepIndex);
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    const payload: StoredState = {
      sessionId,
      segment,
      answers,
      contact,
      stepIndex,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [hydrated, sessionId, segment, answers, contact, stepIndex]);

  const steps = React.useMemo<Step[]>(() => {
    if (!segment) return [{ kind: "segment" }];
    const filtered = questions
      .filter(
        (question) =>
          question.segment === "alle" || question.segment === segment
      )
      .sort((a, b) => a.position - b.position);
    return [
      { kind: "segment" },
      ...filtered.map((question) => ({ kind: "question", question }) as const),
      { kind: "contact" },
    ];
  }, [segment, questions]);

  const clampedStepIndex = Math.min(stepIndex, steps.length - 1);
  const currentStep = steps[clampedStepIndex];

  const goNext = React.useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const goBack = React.useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const selectSegment = React.useCallback(
    (value: Segment, totalSteps: number) => {
      setSegment(value);
      window.setTimeout(
        () => setStepIndex((i) => Math.min(i + 1, totalSteps - 1)),
        300
      );
    },
    []
  );

  const selectSingle = React.useCallback(
    (questionId: string, value: string, totalSteps: number) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      window.setTimeout(
        () => setStepIndex((i) => Math.min(i + 1, totalSteps - 1)),
        300
      );
    },
    []
  );

  const toggleMulti = React.useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: toggleMultiAnswer(prev[questionId], value),
    }));
  }, []);

  const setTextAnswer = React.useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      const step = steps[clampedStepIndex];
      if (!step) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        goBack();
        return;
      }

      if (event.key === "Enter") {
        if (
          step.kind === "question" &&
          (step.question.type === "multi" || step.question.type === "text")
        ) {
          goNext();
        }
        return;
      }

      const digit = Number(event.key);
      if (Number.isNaN(digit) || digit < 1 || digit > 9) return;

      if (step.kind === "segment") {
        const value: Segment | undefined =
          digit === 1 ? "privat" : digit === 2 ? "business" : undefined;
        if (value) selectSegment(value, steps.length);
      } else if (step.kind === "question") {
        const { question } = step;
        if (question.type === "text") return;
        const option = question.options[digit - 1];
        if (!option) return;
        if (question.type === "multi") toggleMulti(question.id, option.value);
        else selectSingle(question.id, option.value, steps.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    steps,
    clampedStepIndex,
    goBack,
    goNext,
    selectSegment,
    selectSingle,
    toggleMulti,
  ]);

  function validateContact(): boolean {
    const parsed = checkContactSchema.safeParse({
      segment,
      name: contact.name,
      email: contact.email,
      company: segment === "business" ? contact.company : undefined,
      consent: contact.consent,
    });

    if (parsed.success) {
      setFieldErrors({});
      return true;
    }

    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = issue.message;
    }
    setFieldErrors(errors);
    return false;
  }

  function handleContactSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    if (!validateContact()) return;
    setSubmitting(true);
    turnstileRef.current?.execute();
  }

  const handleTurnstileVerify = React.useCallback(
    async (token: string) => {
      try {
        const response = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            segment,
            answers,
            name: contact.name,
            email: contact.email,
            company: segment === "business" ? contact.company : undefined,
            consent: contact.consent,
            turnstileToken: token,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          setSubmitError(
            errorBody.error ??
              "Der Check konnte nicht gesendet werden. Bitte versuche es erneut."
          );
          setSubmitting(false);
          turnstileRef.current?.reset();
          return;
        }

        const result = await response.json();
        sessionStorage.removeItem(STORAGE_KEY);
        router.push(`/check/termin?session=${result.sessionId}`);
      } catch {
        setSubmitError(
          "Der Check konnte nicht gesendet werden. Prüfe deine Verbindung und versuche es erneut."
        );
        setSubmitting(false);
        turnstileRef.current?.reset();
      }
    },
    [sessionId, segment, answers, contact, router]
  );

  const handleTurnstileError = React.useCallback(() => {
    setSubmitError(
      "Sicherheitsprüfung fehlgeschlagen. Bitte versuche es erneut."
    );
    setSubmitting(false);
  }, []);

  if (!hydrated) {
    return <div className="min-h-screen" aria-hidden="true" />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ProgressBar progress={(clampedStepIndex + 1) / steps.length} />

      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-6 py-10">
        <div className="mb-8">
          {clampedStepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              aria-label="Zurück"
              className="text-ink-muted hover:text-ink flex size-10 items-center justify-center rounded-lg transition-colors duration-[120ms]"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </button>
          ) : (
            <Link
              href="/"
              aria-label="Zur Startseite"
              className="text-ink-muted hover:text-ink flex size-10 items-center justify-center rounded-lg transition-colors duration-[120ms]"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Link>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-8">
          {currentStep.kind === "segment" ? (
            <div className="flex flex-col gap-6">
              <h1 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
                Bist du privat unterwegs oder für ein Unternehmen?
              </h1>
              <div className="grid gap-4 sm:grid-cols-2">
                <AnswerCard
                  label="Privat"
                  description="Ich möchte KI für mich persönlich verstehen."
                  selected={segment === "privat"}
                  shortcutNumber={1}
                  onSelect={() => selectSegment("privat", steps.length)}
                />
                <AnswerCard
                  label="Unternehmen"
                  description="Ich möchte KI in meinem Team einsetzen."
                  selected={segment === "business"}
                  shortcutNumber={2}
                  onSelect={() => selectSegment("business", steps.length)}
                />
              </div>
            </div>
          ) : null}

          {currentStep.kind === "question" ? (
            <QuestionStep
              question={currentStep.question}
              answer={answers[currentStep.question.id]}
              onSelectSingle={(value) =>
                selectSingle(currentStep.question.id, value, steps.length)
              }
              onToggleMulti={(value) =>
                toggleMulti(currentStep.question.id, value)
              }
              onTextChange={(value) =>
                setTextAnswer(currentStep.question.id, value)
              }
              onNext={goNext}
            />
          ) : null}

          {currentStep.kind === "contact" ? (
            <form
              onSubmit={handleContactSubmit}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <h1 className="text-ink text-[26px] font-bold tracking-[-0.015em] md:text-[34px]">
                  Wie erreiche ich dich?
                </h1>
                <p className="text-ink-soft text-[15px]">
                  Deine Antworten sind gespeichert. Nur noch ein paar Angaben.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="check-name"
                  className="text-ink text-[14px] font-medium"
                >
                  Name
                </label>
                <Input
                  id="check-name"
                  value={contact.name}
                  onChange={(event) =>
                    setContact((c) => ({ ...c, name: event.target.value }))
                  }
                  invalid={Boolean(fieldErrors.name)}
                  autoComplete="name"
                />
                {fieldErrors.name ? (
                  <span className="text-danger text-[13px]">
                    {fieldErrors.name}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="check-email"
                  className="text-ink text-[14px] font-medium"
                >
                  E-Mail
                </label>
                <Input
                  id="check-email"
                  type="email"
                  value={contact.email}
                  onChange={(event) =>
                    setContact((c) => ({ ...c, email: event.target.value }))
                  }
                  invalid={Boolean(fieldErrors.email)}
                  autoComplete="email"
                />
                {fieldErrors.email ? (
                  <span className="text-danger text-[13px]">
                    {fieldErrors.email}
                  </span>
                ) : null}
              </div>

              {segment === "business" ? (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="check-company"
                    className="text-ink text-[14px] font-medium"
                  >
                    Firma
                  </label>
                  <Input
                    id="check-company"
                    value={contact.company}
                    onChange={(event) =>
                      setContact((c) => ({ ...c, company: event.target.value }))
                    }
                    invalid={Boolean(fieldErrors.company)}
                    autoComplete="organization"
                  />
                  {fieldErrors.company ? (
                    <span className="text-danger text-[13px]">
                      {fieldErrors.company}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col gap-1.5">
                <Checkbox
                  checked={contact.consent}
                  onCheckedChange={(checked) =>
                    setContact((c) => ({ ...c, consent: checked }))
                  }
                  label={
                    <>
                      Ich habe die{" "}
                      <Link
                        href="/datenschutz"
                        target="_blank"
                        className="text-accent hover:text-accent-hover underline underline-offset-2"
                      >
                        Datenschutzerklärung
                      </Link>{" "}
                      gelesen.
                    </>
                  }
                />
                {fieldErrors.consent ? (
                  <span className="text-danger text-[13px]">
                    {fieldErrors.consent}
                  </span>
                ) : null}
              </div>

              {submitError ? (
                <p className="text-danger text-[14px]">{submitError}</p>
              ) : null}

              <TurnstileWidget
                ref={turnstileRef}
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
                onVerify={handleTurnstileVerify}
                onError={handleTurnstileError}
              />

              <Button
                type="submit"
                variant="accent"
                size="lg"
                loading={submitting}
                className="self-end"
              >
                Absenden
              </Button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
