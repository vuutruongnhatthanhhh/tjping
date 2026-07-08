const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const logoUrl = `${appUrl}/icon.svg`;

function renderEmailFooter(year: number) {
  return `
    <div style="font-size:12px; color:#94a3b8; text-align:center;">
      <p style="margin:0;">&copy; ${year} TJPing · Reminder automation đa kênh</p>
    </div>
  `;
}

export function renderVerificationEmailHTML({
  verificationUrl,
}: {
  verificationUrl: string;
}) {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style type="text/css">
      body, table, td, p, a, span {
        font-family: Arial, sans-serif;
      }
    </style>
  </head>
  <body style="margin:0; padding:20px; background:#eff6ff;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; padding:24px; border-radius:12px; border:1px solid #dbeafe;">
      <table role="presentation" width="100%" style="border-collapse:collapse; margin:0 0 16px 0;">
        <tr>
          <td align="center">
            <a href="${appUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
              <img src="${logoUrl}" alt="TJPing" width="40" height="40" style="display:block; margin:0 auto;" />
            </a>
          </td>
        </tr>
      </table>

      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0f172a;">
        Xác nhận đăng ký tài khoản
      </h2>

      <p style="font-size:14px; color:#0f172a; margin:0 0 8px 0;">
        Vui lòng nhấn vào nút bên dưới để xác nhận email và kích hoạt tài khoản TJPing của bạn.
      </p>

      <p style="font-size:14px; color:#0f172a; margin:0 0 16px 0;">
        Liên kết xác nhận sẽ hết hạn sau <strong>24 giờ</strong>.
      </p>

      <a href="${verificationUrl}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:#ffffff; font-weight:600; font-size:14px; text-decoration:none; border-radius:8px;">
        Xác nhận tài khoản
      </a>

      <p style="font-size:12px; color:#64748b; margin-top:20px;">
        Nếu bạn không yêu cầu đăng ký tài khoản, bạn có thể bỏ qua email này.
      </p>

      <hr style="border:none; border-top:1px solid #dbeafe; margin:20px 0;" />

      ${renderEmailFooter(year)}
    </div>
  </body>
</html>`;
}

export function renderPasswordResetEmailHTML({
  fullName,
  resetUrl,
}: {
  fullName: string;
  resetUrl: string;
}) {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style type="text/css">
      body, table, td, p, a, span {
        font-family: Arial, sans-serif;
      }
    </style>
  </head>
  <body style="margin:0; padding:20px; background:#eff6ff;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; padding:24px; border-radius:12px; border:1px solid #dbeafe;">
      <table role="presentation" width="100%" style="border-collapse:collapse; margin:0 0 16px 0;">
        <tr>
          <td align="center">
            <a href="${appUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;">
              <img src="${logoUrl}" alt="TJPing" width="40" height="40" style="display:block; margin:0 auto;" />
            </a>
          </td>
        </tr>
      </table>

      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0f172a;">
        Đặt lại mật khẩu
      </h2>

      <p style="font-size:14px; color:#0f172a; margin:0 0 8px 0;">
        Chào <strong>${fullName}</strong>, bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TJPing.
      </p>

      <p style="font-size:14px; color:#0f172a; margin:0 0 16px 0;">
        Nhấn vào nút bên dưới để đi tới trang đặt lại mật khẩu.
      </p>

      <a href="${resetUrl}" style="display:inline-block; padding:12px 20px; background:#2563eb; color:#ffffff; font-weight:600; font-size:14px; text-decoration:none; border-radius:8px;">
        Đặt lại mật khẩu
      </a>

      <p style="font-size:12px; color:#64748b; margin-top:20px;">
        Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể bỏ qua email này.
      </p>

      <hr style="border:none; border-top:1px solid #dbeafe; margin:20px 0;" />

      ${renderEmailFooter(year)}
    </div>
  </body>
</html>`;
}

export function renderFeedbackEmailHTML({
  accountEmail,
  fullName,
  phone,
  message,
}: {
  accountEmail: string;
  fullName: string;
  phone: string;
  message: string;
}) {
  const year = new Date().getFullYear();
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  const safeAccountEmail = escapeHtml(accountEmail);
  const safeFullName = fullName ? escapeHtml(fullName) : "Không có";
  const safePhone = escapeHtml(phone);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style type="text/css">
      body, table, td, p, a, span, div {
        font-family: Arial, sans-serif;
      }
    </style>
  </head>
  <body style="margin:0; padding:20px; background:#eff6ff;">
    <div style="
      max-width:560px;
      margin:0 auto;
      background:#ffffff;
      padding:24px;
      border-radius:12px;
      border:1px solid #dbeafe;
    ">
      <table role="presentation" width="100%" style="border-collapse:collapse; margin:0 0 16px 0;">
        <tr>
          <td align="center">
            <a
              href="${appUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="display:inline-block;"
            >
              <img
                src="${logoUrl}"
                alt="TJPing"
                width="40"
                height="40"
                style="display:block; margin:0 auto;"
              />
            </a>
          </td>
        </tr>
      </table>

      <h2 style="margin:0 0 12px 0; font-size:20px; color:#0f172a;">
        Góp ý mới từ người dùng
      </h2>

      <div style="margin-bottom:16px; border:1px solid #dbeafe; border-radius:10px; overflow:hidden;">
        <div style="padding:12px 16px; background:#f8fbff; border-bottom:1px solid #dbeafe;">
          <p style="margin:0; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase;">
            Email tài khoản
          </p>
          <p style="margin:6px 0 0 0; font-size:14px; color:#0f172a;">
            ${safeAccountEmail}
          </p>
        </div>
        <div style="padding:12px 16px; background:#ffffff; border-bottom:1px solid #dbeafe;">
          <p style="margin:0; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase;">
            Họ tên
          </p>
          <p style="margin:6px 0 0 0; font-size:14px; color:#0f172a;">
            ${safeFullName}
          </p>
        </div>
        <div style="padding:12px 16px; background:#f8fbff;">
          <p style="margin:0; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase;">
            Số điện thoại
          </p>
          <p style="margin:6px 0 0 0; font-size:14px; color:#0f172a;">
            ${safePhone}
          </p>
        </div>
      </div>

      <div style="border:1px solid #dbeafe; border-radius:10px; padding:16px; background:#ffffff;">
        <p style="margin:0 0 10px 0; font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase;">
          Nội dung góp ý
        </p>
        <div style="font-size:14px; line-height:1.6; color:#0f172a;">
          ${safeMessage}
        </div>
      </div>

      <hr style="border:none; border-top:1px solid #dbeafe; margin:20px 0;" />

      ${renderEmailFooter(year)}
    </div>
  </body>
</html>`;
}
