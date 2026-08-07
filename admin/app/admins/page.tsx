"use client";

import { Plus, ShieldOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminGuard from "../components/AdminGuard";
import AdminSidebar from "../components/AdminSidebar";
import { CardSkeleton } from "../components/Skeleton";
import { getAuthSession, getCurrentUser, UserResponse } from "../lib/backendApi";
import {
  ADMIN_TIER_ROLES,
  AdminAccountResponse,
  AdminTierRole,
  SUPER_ADMIN_ROLE,
  createAdmin,
  deactivateAdmin,
  getAdmins,
  updateAdminRole,
} from "../lib/adminApi";

const emptyForm = { fullName: "", email: "", password: "", role: "HR_ADMIN" as AdminTierRole };

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function AdminsContent() {
  const router = useRouter();
  const [admin, setAdmin] = useState<UserResponse | null>(null);
  const [admins, setAdmins] = useState<AdminAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const session = getAuthSession();
  const role = session?.role || "";

  useEffect(() => {
    if (role && role !== SUPER_ADMIN_ROLE) {
      router.replace("/courses");
    }
  }, [role, router]);

  function reload() {
    setLoading(true);
    setError(null);
    getAdmins(0, 100)
      .then((page) => setAdmins(page?.content || []))
      .catch(() => setError("Could not load admin accounts."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (role !== SUPER_ADMIN_ROLE) return;
    getCurrentUser().then(setAdmin).catch(() => undefined);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (role && role !== SUPER_ADMIN_ROLE) {
    return null;
  }

  function openCreate() {
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  async function submitForm() {
    if (!form.fullName.trim() || !form.email.trim() || form.password.length < 8) {
      setFormError("Full name, email and an 8+ character password are required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await createAdmin({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setModalOpen(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create admin account.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(accountId: string, newRole: AdminTierRole) {
    setError(null);
    try {
      await updateAdminRole(accountId, newRole);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role.");
    }
  }

  async function handleDeactivate(account: AdminAccountResponse) {
    if (!window.confirm(`Deactivate ${account.fullName || account.email}? They will no longer be able to log in.`)) return;
    setError(null);
    try {
      await deactivateAdmin(account.id);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not deactivate this admin account.");
    }
  }

  return (
    <main className="admin-shell">
      <AdminSidebar activeHref="/admins" role={role} admin={admin} />

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Ops Console</span>
            <h1>Admins</h1>
            <p>Create and manage platform administrators and their roles.</p>
          </div>
          <button type="button" className="admin-primary-btn" onClick={openCreate}>
            <Plus size={16} strokeWidth={2} /> Add admin
          </button>
        </header>

        {error && <div className="admin-error-banner">{error}</div>}

        <section className="admin-panel admin-panel-wide">
          {loading ? (
            <CardSkeleton lines={5} />
          ) : admins.length ? (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {admins.map((account) => (
                    <tr key={account.id}>
                      <td>
                        <div className="admin-table-person">
                          <span>{(account.fullName || account.email).charAt(0).toUpperCase()}</span>
                          <div>
                            <strong>{account.fullName || "Unnamed admin"}</strong>
                          </div>
                        </div>
                      </td>
                      <td>{account.email}</td>
                      <td>
                        <select
                          value={account.role}
                          onChange={(event) => handleRoleChange(account.id, event.target.value as AdminTierRole)}
                          disabled={!account.active}
                        >
                          {ADMIN_TIER_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={`admin-badge ${account.active ? "is-live" : "is-muted"}`}>
                          {account.active ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td>{formatDate(account.createdAt)}</td>
                      <td>
                        {account.active && (
                          <button
                            type="button"
                            className="admin-icon-danger"
                            title="Deactivate admin"
                            aria-label={`Deactivate ${account.fullName || account.email}`}
                            onClick={() => handleDeactivate(account)}
                          >
                            <ShieldOff size={15} strokeWidth={1.8} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-empty">No admin accounts yet.</p>
          )}
        </section>
      </section>

      {modalOpen && (
        <div className="admin-drawer-overlay" onClick={() => !saving && setModalOpen(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>Add admin</h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>

            <div className="admin-form-grid">
              {formError && <div className="admin-error-banner admin-form-span-2">{formError}</div>}

              <label>
                <span>Full name</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>

              <label>
                <span>Temporary password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  minLength={8}
                />
              </label>

              <label>
                <span>Role</span>
                <select
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as AdminTierRole }))}
                >
                  {ADMIN_TIER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <footer>
              <button type="button" className="admin-ghost-btn" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="admin-primary-btn" onClick={submitForm} disabled={saving}>
                {saving ? "Creating..." : "Create admin"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AdminsPage() {
  return (
    <AdminGuard>
      <AdminsContent />
    </AdminGuard>
  );
}
