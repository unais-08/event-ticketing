"use client";

import React from "react";
import Link from "next/link";

import { checkinByToken } from "@/app/_lib/api";
import { getApiErrorMessage } from "@/app/_lib/errors";
import { getRoleLabel } from "@/app/_lib/roles";
import { useAuthStore } from "@/app/_stores/auth-store";

import Card from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import Input from "@/app/_components/ui/input";
import Label from "@/app/_components/ui/label";
import Pill from "@/app/_components/ui/pill";

// ---------------------------------------------------------------------------
// jsQR is a zero-dependency QR decoder that works purely in-browser.
// Add to your project:  npm install jsqr
// ---------------------------------------------------------------------------
import jsQR from "jsqr";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractToken(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const checkinIndex = trimmed.lastIndexOf("/api/checkin/");
  if (checkinIndex >= 0) {
    return decodeURIComponent(trimmed.slice(checkinIndex + "/api/checkin/".length));
  }
  return trimmed;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CheckinResult = { alreadyCheckedIn: boolean; ticketId: string };

type FeedbackState =
  | { kind: "idle" }
  | { kind: "scanning" }
  | { kind: "processing" }
  | { kind: "success"; alreadyCheckedIn: boolean; ticketId: string }
  | { kind: "error"; message: string };

// ---------------------------------------------------------------------------
// Full-screen feedback overlay
// ---------------------------------------------------------------------------
function FeedbackOverlay({
  state,
  onDismiss,
}: {
  state: FeedbackState;
  onDismiss: () => void;
}) {
  if (state.kind === "idle" || state.kind === "scanning" || state.kind === "processing") {
    return null;
  }

  const isSuccess = state.kind === "success";
  const isAlreadyUsed = isSuccess && state.alreadyCheckedIn;

  const bgColor = isSuccess && !isAlreadyUsed ? "#16a34a" : isAlreadyUsed ? "#d97706" : "#dc2626";
  const icon = isSuccess && !isAlreadyUsed ? "✓" : isAlreadyUsed ? "!" : "✗";
  const headline = isSuccess
    ? isAlreadyUsed
      ? "Already Used"
      : "Admitted"
    : "Denied";
  const sub = isSuccess
    ? isAlreadyUsed
      ? `Ticket ${state.ticketId} was already checked in`
      : `Ticket ${state.ticketId} — Welcome!`
    : state.message;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={headline}
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: bgColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        padding: "2rem",
        cursor: "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Pulsing ring behind icon */}
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 54,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {icon}
        </div>
      </div>
      <p
        style={{
          color: "#fff",
          fontSize: 44,
          fontWeight: 700,
          margin: 0,
          letterSpacing: "-0.5px",
          textAlign: "center",
        }}
      >
        {headline}
      </p>
      <p
        style={{
          color: "rgba(255,255,255,0.82)",
          fontSize: 16,
          margin: 0,
          textAlign: "center",
          maxWidth: 280,
          lineHeight: 1.5,
        }}
      >
        {sub}
      </p>
      <p
        style={{
          position: "absolute",
          bottom: 32,
          color: "rgba(255,255,255,0.6)",
          fontSize: 14,
          margin: 0,
        }}
      >
        Tap anywhere to dismiss
      </p>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Camera QR scanner panel
// ---------------------------------------------------------------------------
function CameraScanner({
  onDetected,
  onClose,
}: {
  onDetected: (token: string) => void;
  onClose: () => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = React.useState("");

  // Start camera
  React.useEffect(() => {
    let active = true;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scanLoop();
        }
      } catch (err) {
        if (active) {
          setCameraError("Camera access denied or unavailable. Please paste the token instead.");
        }
      }
    })();

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scanLoop() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code?.data) {
          onDetected(extractToken(code.data));
          return; // stop scanning after first hit
        }
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 8888,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {cameraError ? (
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "#fff",
            maxWidth: 300,
          }}
        >
          <p style={{ fontSize: 16, marginBottom: "1.5rem" }}>{cameraError}</p>
          <button
            onClick={onClose}
            style={{
              padding: "0.75rem 2rem",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      ) : (
        <>
          {/* Video feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Hidden canvas for frame analysis */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Viewfinder overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            {/* Dark vignette corners */}
            <div
              style={{
                width: 240,
                height: 240,
                border: "2px solid rgba(255,255,255,0.9)",
                borderRadius: 16,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
                position: "relative",
              }}
            >
              {/* Animated scan line */}
              <div
                style={{
                  position: "absolute",
                  left: 8,
                  right: 8,
                  height: 2,
                  background: "rgba(74,222,128,0.8)",
                  borderRadius: 1,
                  animation: "scanline 1.8s ease-in-out infinite",
                }}
              />
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
                marginTop: 20,
                textShadow: "0 1px 4px rgba(0,0,0,0.6)",
              }}
            >
              Point camera at QR code
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff",
              fontSize: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            aria-label="Close scanner"
          >
            ✕
          </button>

          <style>{`
            @keyframes scanline {
              0%   { top: 8px; }
              50%  { top: calc(100% - 10px); }
              100% { top: 8px; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function CheckerCheckInPage() {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  const [tokenInput, setTokenInput] = React.useState("");
  const [feedback, setFeedback] = React.useState<FeedbackState>({ kind: "idle" });
  const [showCamera, setShowCamera] = React.useState(false);

  const canShowCheckerUI = user?.role === "CHECKER";

  // Process a token string (from input field OR camera)
  const processToken = React.useCallback(async (raw: string) => {
    const token = extractToken(raw);
    if (!token) return;

    setFeedback({ kind: "processing" });

    try {
      const response = await checkinByToken(token);
      const data: any = response.data;
      setFeedback({
        kind: "success",
        alreadyCheckedIn: data.alreadyCheckedIn,
        ticketId: data.ticketId,
      });
    } catch (err) {
      setFeedback({
        kind: "error",
        message: getApiErrorMessage(err, "Unable to process check-in."),
      });
    }
  }, []);

  // Camera QR detected
  const handleQrDetected = React.useCallback(
    (token: string) => {
      setShowCamera(false);
      setTokenInput(token);
      processToken(token);
    },
    [processToken]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processToken(tokenInput);
  };

  const handleDismiss = () => {
    setFeedback({ kind: "idle" });
    setTokenInput("");
  };

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <Card className="h-72 animate-pulse bg-white/70" />
      </div>
    );
  }

  // ── Not a checker ───────────────────────────────────────────────────────
  if (!canShowCheckerUI) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Card className="space-y-4">
          <Pill>Access required</Pill>
          <h1 className="text-3xl font-semibold text-[var(--color-ink)]">
            Checker check-in
          </h1>
          <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
            You are signed in as {getRoleLabel(user?.role ?? null)}.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button size="sm">Log in</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">Browse events</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const isProcessing = feedback.kind === "processing";

  return (
    <>
      {/* ── Full-screen result flash ─────────────────────────────────────── */}
      <FeedbackOverlay state={feedback} onDismiss={handleDismiss} />

      {/* ── Camera scanner (full-screen) ─────────────────────────────────── */}
      {showCamera && (
        <CameraScanner
          onDetected={handleQrDetected}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* ── Main UI ──────────────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <Pill>Gate check-in</Pill>
            <h1 className="text-4xl font-semibold text-[var(--color-ink)]">
              Check-in
            </h1>
            <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
              Tap <strong>Scan QR</strong> to use your camera, or paste a token
              / URL below.
            </p>
          </div>

          {/* Big camera button */}
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            disabled={isProcessing}
            style={{
              width: "100%",
              minHeight: 72,
              borderRadius: 16,
              background: "#18181b",
              color: "#fff",
              border: "none",
              fontSize: 18,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              cursor: isProcessing ? "default" : "pointer",
              opacity: isProcessing ? 0.5 : 1,
              letterSpacing: "-0.2px",
            }}
            aria-label="Open camera to scan QR code"
          >
            {/* Camera icon using inline SVG (no extra dep) */}
            <svg
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {isProcessing ? "Processing…" : "Scan QR Code"}
          </button>

          {/* Manual token form */}
          <Card className="space-y-4 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-ink-muted)]">
              Or paste token manually
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm">QR token / URL</Label>
                <Input
                  id="token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste token or full /api/checkin/… URL"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setTokenInput("")}
                  size="sm"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessing || !tokenInput.trim()}
                  size="sm"
                >
                  {isProcessing ? "Processing…" : "Submit"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Tip */}
          <Card className="space-y-1 p-4 sm:p-5">
            <Pill>Tip</Pill>
            <p className="text-sm leading-6 text-[var(--color-ink-muted)]">
              Green flash = admitted. Red flash = denied / invalid ticket.
              Amber flash = ticket already scanned. Tap anywhere to dismiss and
              scan the next guest.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}