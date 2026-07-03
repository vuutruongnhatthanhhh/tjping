import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendMail } from "@/lib/mailer";
import { renderPasswordResetEmailHTML } from "@/lib/emailTemplates";

type RecoveryLinkResponse = {
  properties?: {
    hashed_token?: string | null;
    token_hash?: string | null;
    verification_type?: string | null;
    type?: string | null;
  } | null;
  user?: {
    user_metadata?: {
      full_name?: string | null;
    } | null;
  } | null;
};

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
    const { email } = await req.json();
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Thiếu email cần khôi phục." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const siteUrl =
      req.nextUrl.origin ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";
    const redirectTo = `${siteUrl}/reset-password`;

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: normalizedEmail,
      options: {
        redirectTo,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: `[Supabase] ${error.message}` },
        { status: 500 },
      );
    }

    const linkData = data as RecoveryLinkResponse | null;
    const tokenHash =
      linkData?.properties?.hashed_token ||
      linkData?.properties?.token_hash ||
      null;
    const linkType =
      linkData?.properties?.verification_type ||
      linkData?.properties?.type ||
      "recovery";

    const resetUrl = tokenHash
      ? `${siteUrl}/reset-password?token_hash=${encodeURIComponent(tokenHash)}&type=${encodeURIComponent(linkType)}`
      : `${siteUrl}/reset-password`;

    const fullName =
      data?.user?.user_metadata?.full_name ||
      normalizedEmail.split("@")[0] ||
      "bạn";

    await sendMail({
      to: normalizedEmail,
      subject: "Đặt lại mật khẩu TJPing",
      html: renderPasswordResetEmailHTML({
        fullName,
        resetUrl,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `[Server] ${(error as Error).message ?? "Lỗi không xác định."}` },
      { status: 500 },
    );
  }
}
