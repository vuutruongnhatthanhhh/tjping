import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { renderVerificationEmailHTML } from "@/lib/emailTemplates";
import { sendMail } from "@/lib/mailer";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "[Config] SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình." },
      { status: 500 },
    );
  }

  if (
    !process.env.GMAIL_OAUTH_USER ||
    !process.env.GMAIL_CLIENT_ID ||
    !process.env.GMAIL_CLIENT_SECRET ||
    !process.env.GMAIL_REFRESH_TOKEN
  ) {
    return NextResponse.json(
      { error: "[Config] Gmail OAuth2 chưa được cấu hình." },
      { status: 500 },
    );
  }

  try {
    const { email, password } = await req.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Thiếu thông tin đăng ký." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: false,
      });

    if (createError) {
      const isDuplicate =
        createError.message.toLowerCase().includes("already") ||
        createError.message.toLowerCase().includes("exists");

      return NextResponse.json(
        {
          error: isDuplicate
            ? "Email này đã được đăng ký. Vui lòng đăng nhập."
            : createError.message,
        },
        { status: isDuplicate ? 409 : 500 },
      );
    }

    const userId = userData.user.id;
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toISOString();

    const { error: tokenError } = await supabase
      .from("email_verifications")
      .insert({ user_id: userId, token, expires_at: expiresAt });

    if (tokenError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: tokenError.message }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verificationUrl = `${siteUrl}/verify-email?token=${token}`;

    try {
      await sendMail({
        to: normalizedEmail,
        subject: "Xác nhận email đăng ký TJPing",
        html: renderVerificationEmailHTML({ verificationUrl }),
      });
    } catch (error) {
      await supabase.from("email_verifications").delete().eq("user_id", userId);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `[Mail] ${(error as Error).message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `[Server] ${(error as Error).message}` },
      { status: 500 },
    );
  }
}
