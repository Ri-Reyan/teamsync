"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invitationId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!invitationId) {
      showToast.error("Invalid invitation link");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.post(
        `/user/workspace/invitations/${invitationId}/accept`,
      );

      if (res.data.success) {
        setSuccess(true);
        showToast.success("Successfully joined the workspace!");

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const msg =
          err.response?.data?.message || "Failed to accept invitation";
        setErrorMsg(msg);
        showToast.error(msg);
      } else {
        setErrorMsg("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!invitationId) {
    return (
      <div className="border-4 border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <XCircle className="mx-auto h-12 w-12 text-[#FF6B6B]" />
        <h2 className="mt-4 text-2xl font-black uppercase">Invalid Link</h2>
        <p className="mt-2 font-bold text-gray-600">
          No invitation ID was provided in the URL.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md border-4 border-black bg-[#FFFDF5] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex flex-col items-center border-b-4 border-black pb-6 text-center">
        <div className="mb-3 border-3 border-black bg-[#FFD93D] p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <ShieldCheck className="h-8 w-8 text-black" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">
          Workspace Invitation
        </h1>
        <p className="mt-1 text-xs font-bold text-gray-600 uppercase">
          TeamSync Collaboration
        </p>
      </div>

      {/* Content Body */}
      <div className="py-6 text-center">
        {success ? (
          <div className="space-y-4">
            <div className="inline-flex border-3 border-black bg-[#6BCB77] p-2 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle2 className="h-10 w-10 text-black" />
            </div>
            <h3 className="text-xl font-black uppercase">You&apos;re In!</h3>
            <p className="text-sm font-bold text-gray-700">
              Invitation accepted! Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-800">
              You have been invited to join a workspace. Click below to accept
              the invitation and start collaborating.
            </p>

            {errorMsg && (
              <div className="border-2 border-black bg-[#FF6B6B] p-3 text-xs font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {errorMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!success && (
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 border-3 border-black bg-[#4D96FF] py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-70"
          >
            {loading ? (
              <HypotrochoidLoader />
            ) : (
              <>
                <span>Accept & Join</span>
                <ArrowRight className="h-5 w-5 stroke-3" />
              </>
            )}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            disabled={loading}
            className="w-full border-3 border-black bg-white py-2.5 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Decline / Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF5] p-4 font-sans text-black">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <HypotrochoidLoader size={24} color="#000000" />
            <span className="font-black uppercase">Loading link...</span>
          </div>
        }
      >
        <AcceptInvitationContent />
      </Suspense>
    </div>
  );
}
