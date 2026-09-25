"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  workspaceCount: number;
  projectCount: number;
  totalAmountReceived: number;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  isPremium: boolean;
  package: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

interface AdminForm {
  username: string;
  email: string;
  password: string;
  role: string;
}

const emptyStats: DashboardStats = {
  totalUsers: 0,
  premiumUsers: 0,
  workspaceCount: 0,
  projectCount: 0,
  totalAmountReceived: 0,
};

const emptyAdminForm: AdminForm = {
  username: "",
  email: "",
  password: "",
  role: "ADMIN",
};

function errorMessage(error: unknown, fallback: string) {
  return isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function LoginScreen({ onLogin }: { onLogin: () => Promise<void> }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin1234");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/login", { email, password });
      await onLogin();
    } catch (error: unknown) {
      showToast.error(errorMessage(error, "Unable to sign in as admin."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#101820] px-5 py-8 text-[#F8F4E8] sm:px-10 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="max-w-xl">
          <div className="mb-8 flex items-center gap-3 text-[#B9F227]">
            <span className="flex h-12 w-12 items-center justify-center border-2 border-[#B9F227]">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span className="font-mono text-sm font-bold uppercase tracking-[0.18em]">
              TeamSync / Control
            </span>
          </div>
          <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#62D7FF]">
            Private operations console
          </p>
          <h1 className="max-w-2xl text-5xl font-black uppercase leading-[0.92] tracking-tight sm:text-7xl">
            Keep the whole system in view.
          </h1>
          <p className="mt-7 max-w-md border-l-4 border-[#FF6B6B] pl-5 text-lg font-medium leading-7 text-[#D7E0E5]">
            Monitor growth, payment health, and account access from one focused
            command surface.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 font-mono text-xs font-bold uppercase">
            <span className="border border-[#334653] px-3 py-2 text-[#B9F227]">
              Authenticated access
            </span>
            <span className="border border-[#334653] px-3 py-2 text-[#62D7FF]">
              Live aggregates
            </span>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="border-4 border-[#F8F4E8] bg-[#F8F4E8] p-6 text-[#101820] shadow-[10px_10px_0px_0px_#B9F227] sm:p-9"
        >
          <div className="mb-9 flex items-start justify-between gap-4 border-b-2 border-[#101820] pb-5">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#52636D]">
                Admin access
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase">Sign in</h2>
            </div>
            <KeyRound className="h-8 w-8 text-[#FF6B6B]" />
          </div>
          <label className="mb-5 block">
            <span className="mb-2 block font-mono text-xs font-bold uppercase">
              Email
            </span>
            <span className="flex items-center border-2 border-[#101820] bg-white px-3 focus-within:ring-4 focus-within:ring-[#62D7FF]">
              <Mail className="h-5 w-5" />
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-12 w-full bg-transparent px-3 font-medium outline-none"
                autoComplete="email"
              />
            </span>
          </label>
          <label className="mb-8 block">
            <span className="mb-2 block font-mono text-xs font-bold uppercase">
              Password
            </span>
            <span className="flex items-center border-2 border-[#101820] bg-white px-3 focus-within:ring-4 focus-within:ring-[#62D7FF]">
              <KeyRound className="h-5 w-5" />
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-12 w-full bg-transparent px-3 font-medium outline-none"
                autoComplete="current-password"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 border-2 border-[#101820] bg-[#B9F227] px-5 font-black uppercase transition duration-200 hover:bg-[#62D7FF] disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? (
              <HypotrochoidLoader size={18} color="#101820" />
            ) : (
              <ArrowUpRight className="h-5 w-5" />
            )}
            {isSubmitting ? "Checking access" : "Enter console"}
          </button>
        </form>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  color: string;
}) {
  return (
    <article className="border-2 border-[#101820] bg-white p-5 shadow-[5px_5px_0px_0px_#101820]">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center border-2 border-[#101820] ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <Activity className="h-4 w-4 text-[#7A8991]" aria-label="Live metric" />
      </div>
      <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#52636D]">
        {label}
      </p>
      <p className="mt-1 text-4xl font-black tracking-tight">{value}</p>
      <p className="mt-2 text-sm font-medium text-[#52636D]">{detail}</p>
    </article>
  );
}

function CreateAdminPanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<AdminForm>(emptyAdminForm);
  const [otp, setOtp] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof AdminForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const requestVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/register", form);
      setIsOtpStep(true);
      showToast.success("Verification code sent to the new admin email.");
    } catch (error: unknown) {
      showToast.error(errorMessage(error, "Could not start admin creation."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/verify-email", { email: form.email, otp });
      showToast.success("New admin created successfully.");
      onCreated();
    } catch (error: unknown) {
      showToast.error(errorMessage(error, "Could not verify the new admin."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#101820]/75 p-5 backdrop-blur-sm">
      <div className="w-full max-w-lg border-4 border-[#101820] bg-[#F8F4E8] p-6 text-[#101820] shadow-[8px_8px_0px_0px_#FF6B6B] sm:p-8">
        <div className="mb-7 flex items-start justify-between border-b-2 border-[#101820] pb-5">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#52636D]">
              Restricted action
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase">Add admin</h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 transition hover:bg-[#FF6B6B]"
            aria-label="Close add admin dialog"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!isOtpStep ? (
          <form onSubmit={requestVerification} className="space-y-4">
            {(["username", "email", "password"] as const).map((field) => (
              <label key={field} className="block">
                <span className="mb-2 block font-mono text-xs font-bold uppercase">
                  {field}
                </span>
                <input
                  required
                  type={
                    field === "password"
                      ? "password"
                      : field === "email"
                        ? "email"
                        : "text"
                  }
                  value={form[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  className="min-h-12 w-full border-2 border-[#101820] bg-white px-3 font-medium outline-none focus:ring-4 focus:ring-[#62D7FF]"
                  autoComplete={field === "password" ? "new-password" : field}
                />
              </label>
            ))}
            <button
              disabled={isSubmitting}
              className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 border-2 border-[#101820] bg-[#62D7FF] font-black uppercase hover:bg-[#B9F227] disabled:opacity-60"
            >
              {isSubmitting && <HypotrochoidLoader size={14} color="#101820" />}
              Send verification code
            </button>
          </form>
        ) : (
          <form onSubmit={verifyAdmin}>
            <p className="mb-5 text-sm font-medium leading-6 text-[#52636D]">
              Enter the six-digit code sent to{" "}
              <strong className="text-[#101820]">{form.email}</strong>.
            </p>
            <label className="block">
              <span className="mb-2 block font-mono text-xs font-bold uppercase">
                Email code
              </span>
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, ""))
                }
                className="min-h-14 w-full border-2 border-[#101820] bg-white px-3 text-center font-mono text-2xl font-bold tracking-[0.5em] outline-none focus:ring-4 focus:ring-[#62D7FF]"
                autoFocus
              />
            </label>
            <button
              disabled={isSubmitting}
              className="mt-5 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 border-2 border-[#101820] bg-[#B9F227] font-black uppercase hover:bg-[#62D7FF] disabled:opacity-60"
            >
              {isSubmitting && <HypotrochoidLoader size={14} color="#101820" />}
              Verify and create admin
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);
  const [isCreateAdminOpen, setIsCreateAdminOpen] = useState(false);

  const fetchDashboard = async () => {
    setIsRefreshing(true);
    try {
      const [dashboardResponse, usersResponse] = await Promise.all([
        api.get("/admin/panel/dashboard"),
        api.get("/admin/panel/users"),
      ]);
      setStats(dashboardResponse.data.data);
      setUsers(usersResponse.data.data);
      setIsAuthenticated(true);
      setLastUpdated(new Date());
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status !== 401) {
        showToast.error(errorMessage(error, "Unable to load admin data."));
      }
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchDashboard();
    };
    void loadDashboard();
  }, []);

  const suspendUser = async (user: AdminUser) => {
    setSuspendingUserId(user.id);
    try {
      await api.patch(`/admin/panel/users/${user.id}/suspend`);
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id
            ? { ...currentUser, status: "SUSPENDED" }
            : currentUser,
        ),
      );
      showToast.success(`${user.username} has been suspended.`);
    } catch (error: unknown) {
      showToast.error(errorMessage(error, "Unable to suspend this user."));
    } finally {
      setSuspendingUserId(null);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setIsAuthenticated(false);
      showToast.success("Signed out of admin console.");
    } catch (error: unknown) {
      showToast.error(errorMessage(error, "Unable to sign out."));
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#101820] text-[#B9F227]">
        <HypotrochoidLoader
          size={52}
          color="#B9F227"
          aria-label="Loading admin console"
        />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={fetchDashboard} />;
  }

  return (
    <main className="min-h-screen bg-[#F8F4E8] text-[#101820]">
      <header className="border-b-4 border-[#101820] bg-[#101820] px-5 py-5 text-[#F8F4E8] sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-[#B9F227] text-[#B9F227]">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#B9F227]">
                TeamSync / Control
              </p>
              <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl">
                Operations dashboard
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 border border-[#334653] px-3 py-2 font-mono text-xs font-bold uppercase text-[#B9F227]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#B9F227]" />{" "}
              Live data
            </span>
            <button
              onClick={logout}
              className="flex min-h-11 cursor-pointer items-center gap-2 border-2 border-[#F8F4E8] px-4 font-black uppercase transition hover:bg-[#FF6B6B]"
              title="Log out of admin console"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-10 sm:py-10">
        <section className="flex flex-col gap-4 border-b-2 border-[#101820] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#52636D]">
              System pulse
            </p>
            <h2 className="mt-2 text-4xl font-black uppercase leading-none sm:text-5xl">
              The numbers that matter.
            </h2>
            <p className="mt-3 max-w-xl font-medium text-[#52636D]">
              A fresh snapshot of TeamSync activity, accounts, and revenue.
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={isRefreshing}
            className="flex min-h-11 cursor-pointer items-center justify-center gap-2 border-2 border-[#101820] bg-[#62D7FF] px-4 font-black uppercase shadow-[4px_4px_0px_0px_#101820] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#101820] disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </button>
        </section>

        <section
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
          aria-label="Dashboard metrics"
        >
          <MetricCard
            label="Total users"
            value={stats.totalUsers.toLocaleString()}
            detail="Active platform accounts"
            icon={Users}
            color="bg-[#B9F227]"
          />
          <MetricCard
            label="Premium users"
            value={stats.premiumUsers.toLocaleString()}
            detail="Paid plan accounts"
            icon={UserRound}
            color="bg-[#62D7FF]"
          />
          <MetricCard
            label="Workspaces"
            value={stats.workspaceCount.toLocaleString()}
            detail="Teams in the system"
            icon={LayoutDashboard}
            color="bg-[#FFD93D]"
          />
          <MetricCard
            label="Projects"
            value={stats.projectCount.toLocaleString()}
            detail="Across every workspace"
            icon={FolderKanban}
            color="bg-[#FF9F68]"
          />
          <MetricCard
            label="Received"
            value={formatMoney(stats.totalAmountReceived)}
            detail="Successful payments"
            icon={CircleDollarSign}
            color="bg-[#FF6B6B]"
          />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1fr_0.34fr]">
          <div className="min-w-0 border-2 border-[#101820] bg-white shadow-[6px_6px_0px_0px_#101820]">
            <div className="flex flex-col gap-4 border-b-2 border-[#101820] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#52636D]">
                  Account directory
                </p>
                <h2 className="mt-1 text-2xl font-black uppercase">Users</h2>
              </div>
              <p className="font-mono text-xs font-bold uppercase text-[#52636D]">
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Waiting for update"}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w- text-left">
                <thead className="border-b-2 border-[#101820] bg-[#EAF0F2] font-mono text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Plan</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#D7E0E5] last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold">{user.username}</p>
                        <p className="mt-1 text-sm text-[#52636D]">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-bold uppercase ${user.isPremium ? "text-[#D35B00]" : "text-[#52636D]"}`}
                        >
                          {user.isPremium && (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          )}
                          {user.package}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-2 font-mono text-xs font-bold uppercase ${user.status === "ACTIVE" ? "text-[#157A3D]" : "text-[#C42B2B]"}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${user.status === "ACTIVE" ? "bg-[#157A3D]" : "bg-[#C42B2B]"}`}
                          />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => suspendUser(user)}
                          disabled={
                            user.status === "SUSPENDED" ||
                            suspendingUserId === user.id
                          }
                          className="cursor-pointer border-2 border-[#101820] px-3 py-2 font-mono text-xs font-bold uppercase transition hover:bg-[#FF6B6B] disabled:cursor-not-allowed disabled:border-[#B7C1C6] disabled:text-[#7A8991]"
                        >
                          {suspendingUserId === user.id
                            ? "Working"
                            : user.status === "SUSPENDED"
                              ? "Suspended"
                              : "Suspend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="p-8 text-center font-medium text-[#52636D]">
                  No user accounts yet.
                </p>
              )}
            </div>
          </div>

          <aside className="border-2 border-[#101820] bg-[#101820] p-5 text-[#F8F4E8] shadow-[6px_6px_0px_0px_#B9F227]">
            <div className="flex h-11 w-11 items-center justify-center border-2 border-[#B9F227] text-[#B9F227]">
              <UserRoundPlus className="h-5 w-5" />
            </div>
            <p className="mt-7 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#B9F227]">
              Access control
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase leading-none">
              Grow the admin team.
            </h2>
            <p className="mt-4 text-sm font-medium leading-6 text-[#D7E0E5]">
              Invite a trusted operator and verify their email before they
              receive console access.
            </p>
            <button
              onClick={() => setIsCreateAdminOpen(true)}
              className="mt-8 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 border-2 border-[#101820] bg-[#B9F227] px-4 font-black uppercase text-[#101820] transition hover:bg-[#62D7FF]"
            >
              <UserRoundPlus className="h-4 w-4" /> Create admin
            </button>
            <div className="mt-8 border-t border-[#334653] pt-5 font-mono text-xs uppercase text-[#91A5AF]">
              <p className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#B9F227]" /> OTP verified
              </p>
              <p className="mt-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#FF9F68]" /> Admin only
              </p>
            </div>
          </aside>
        </section>
      </div>

      {isCreateAdminOpen && (
        <CreateAdminPanel
          onClose={() => setIsCreateAdminOpen(false)}
          onCreated={() => setIsCreateAdminOpen(false)}
        />
      )}
    </main>
  );
}
