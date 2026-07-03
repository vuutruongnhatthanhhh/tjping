"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Save, User2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ModalOverlay from "@/components/ui/ModalOverlay";

interface AccountSettingsModalProps {
  userEmail?: string;
  userName?: string;
  onClose: () => void;
  onSaved: () => void;
}

const fullNameMaxLength = 50;
const passwordMaxLength = 128;

export default function AccountSettingsModal({
  userEmail,
  userName,
  onClose,
  onSaved,
}: AccountSettingsModalProps) {
  const [fullName, setFullName] = useState(userName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleProfileSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setProfileError("Vui lòng nhập họ và tên.");
      return;
    }

    if (trimmedName.length > fullNameMaxLength) {
      setProfileError(`Họ và tên không được vượt quá ${fullNameMaxLength} ký tự.`);
      return;
    }

    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: trimmedName },
    });

    setProfileLoading(false);

    if (error) {
      setProfileError("Không thể cập nhật thông tin. Vui lòng thử lại.");
      return;
    }

    setProfileSuccess("Cập nhật thông tin thành công.");
    onSaved();
  };

  const handlePasswordSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userEmail) {
      setPasswordError("Không tìm thấy email tài khoản.");
      return;
    }

    if (!currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu cũ.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu không khớp.");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    const supabase = createClient();
    const signInResult = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInResult.error) {
      setPasswordLoading(false);
      setPasswordError("Mật khẩu cũ không đúng.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPasswordLoading(false);

    if (error) {
      setPasswordError("Không thể đổi mật khẩu. Vui lòng thử lại.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess("Đổi mật khẩu thành công.");
  };

  return (
    <ModalOverlay
      onClose={onClose}
      panelClassName="flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:max-w-lg sm:rounded-3xl"
      panelStyle={{
        background: "rgba(7,18,34,0.98)",
        border: "1px solid rgba(96,165,250,0.18)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div
        className="flex items-center justify-between border-b px-6 py-5"
        style={{ borderColor: "rgba(96,165,250,0.12)" }}
      >
        <div>
          <p className="text-lg font-semibold text-white">Tài khoản</p>
          <p className="mt-1 text-sm text-slate-400">
            Cập nhật thông tin cá nhân và đổi mật khẩu.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300 transition-colors"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-6 custom-scrollbar">
        <form
          onSubmit={handleProfileSave}
          className="space-y-4 rounded-2xl border p-4"
          style={{
            borderColor: "rgba(96,165,250,0.14)",
            background: "rgba(11,27,48,0.56)",
          }}
        >
          <div className="flex items-center gap-2">
            <User2 className="h-4 w-4 text-sky-300" />
            <p className="text-sm font-semibold text-white">Thông tin cá nhân</p>
          </div>

          {profileError && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {profileError}
            </div>
          )}

          {profileSuccess && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {profileSuccess}
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Họ và tên
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                if (profileError) setProfileError("");
                if (profileSuccess) setProfileSuccess("");
              }}
              maxLength={fullNameMaxLength}
              placeholder="Nguyễn Văn A"
              className="input-mystic"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-sky-400/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
              <Mail className="h-4 w-4 text-sky-300" />
              <span className="truncate">{userEmail || "Chưa có email"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tối đa {fullNameMaxLength} ký tự</span>
            <span>
              {fullName.trim().length}/{fullNameMaxLength}
            </span>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-70"
            >
              {profileLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu thông tin
            </button>
          </div>
        </form>

        <form
          onSubmit={handlePasswordSave}
          className="space-y-4 rounded-2xl border p-4"
          style={{
            borderColor: "rgba(96,165,250,0.14)",
            background: "rgba(11,27,48,0.56)",
          }}
        >
          <div className="flex items-center gap-2">
            <Save className="h-4 w-4 text-sky-300" />
            <p className="text-sm font-semibold text-white">Đổi mật khẩu</p>
          </div>

          <p className="text-sm text-slate-400">
            Nhập mật khẩu cũ để xác nhận trước khi đổi sang mật khẩu mới.
          </p>

          {passwordError && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {passwordSuccess}
            </div>
          )}

          <PasswordField
            label="Mật khẩu cũ"
            value={currentPassword}
            onChange={(value) => {
              setCurrentPassword(value);
              if (passwordError) setPasswordError("");
              if (passwordSuccess) setPasswordSuccess("");
            }}
            showValue={showCurrentPassword}
            onToggle={() => setShowCurrentPassword((current) => !current)}
            placeholder="Nhập mật khẩu cũ"
          />

          <PasswordField
            label="Mật khẩu mới"
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value);
              if (passwordError) setPasswordError("");
              if (passwordSuccess) setPasswordSuccess("");
            }}
            showValue={showNewPassword}
            onToggle={() => setShowNewPassword((current) => !current)}
            placeholder="Tối thiểu 6 ký tự"
          />

          <PasswordField
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              if (passwordError) setPasswordError("");
              if (passwordSuccess) setPasswordSuccess("");
            }}
            showValue={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((current) => !current)}
            placeholder="Nhập lại mật khẩu mới"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-70"
            >
              {passwordLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu mật khẩu mới
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  showValue,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showValue: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <div className="relative">
        <input
          type={showValue ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={passwordMaxLength}
          placeholder={placeholder}
          className="input-mystic pr-12"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        >
          {showValue ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
