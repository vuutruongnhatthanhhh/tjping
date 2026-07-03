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
