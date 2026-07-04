# Phase 1 Telegram Bot Setup

## Mục tiêu

Phase 1 cho phép:

- Liên kết tài khoản TJPing với Telegram bot
- Tạo lời nhắc nhanh bằng lệnh Telegram
- Xem danh sách lời nhắc gần nhất
- Xóa lời nhắc bằng Telegram

Các lệnh hiện hỗ trợ:

- `/start <token>`
- `/remind dd/mm/yyyy HH:mm nội dung`
- `/list`
- `/delete <8 ký tự đầu của ID>`
- `/help`

## 1. Biến môi trường cần có

Thêm các biến sau vào file `.env.local` hoặc hệ thống deploy:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

TELEGRAM_BOT_TOKEN=...
TELEGRAM_WEBHOOK_SECRET=your-random-secret
TELEGRAM_BOT_USERNAME=YourBotUsername
```

Ghi chú:

- `TELEGRAM_BOT_USERNAME` là optional. Nếu không có, code đang fallback về `TJPingBot`
- `TELEGRAM_WEBHOOK_SECRET` nên là chuỗi random dài để Telegram webhook khó bị giả mạo

## 2. Chạy migration

Chạy các migration mới:

- `migrations/0006_add_custom_weekly_repeat.sql`
- `migrations/0007_add_custom_weekly_repeat_constraint.sql`
- `migrations/0008_add_telegram_link_support.sql`

Nếu chạy tay trên Supabase SQL Editor:

1. Chạy `0006`
2. Chạy `0007`
3. Chạy `0008`

## 3. Set Telegram webhook

Sau khi deploy app lên domain public HTTPS, gọi API Telegram:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-domain.com/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Ví dụ:

```bash
curl -X POST "https://api.telegram.org/bot123456:ABCDEF/setWebhook" \
  -d "url=https://tjping.com/api/telegram/webhook" \
  -d "secret_token=my-super-secret"
```

Kiểm tra webhook:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

## 4. Cách liên kết tài khoản Telegram với TJPing

Trong app:

1. Vào trang `Kênh gửi`
2. Ở phần `Cấu hình Telegram`, bấm `Kết nối nhanh`
3. App sẽ mở bot Telegram ở tab mới
4. Nếu Telegram không tự điền sẵn lệnh, copy lệnh `/start <token>` trong app và gửi cho bot
5. Khi bot báo liên kết thành công, quay lại app và bấm `Lưu cấu hình` nếu cần

Sau khi liên kết:

- `telegram_chat_id` sẽ được lưu tự động
- `telegram_username` sẽ được lưu nếu Telegram trả về
- `telegram_enabled` sẽ được bật tự động

## 5. Cách dùng bot

### Tạo lời nhắc

```text
/remind 05/07/2026 07:45 Họp team sale
```

Kết quả:

- tạo reminder mới
- kênh gửi mặc định là `Telegram`
- loại lặp lại mặc định là `once`
- bước nhắc mặc định là `on_time`

### Xem danh sách reminder

```text
/list
```

Bot sẽ trả về tối đa 10 reminder `pending` hoặc `failed` gần nhất.

### Xóa reminder

```text
/delete ab12cd34
```

Trong đó `ab12cd34` là 8 ký tự đầu của ID reminder lấy từ lệnh `/list`.

### Xem hướng dẫn

```text
/help
```

## 6. Giới hạn hiện tại của phase 1

Phase 1 đang intentionally đơn giản:

- Chỉ hỗ trợ tạo nhanh với format cố định `dd/mm/yyyy HH:mm nội dung`
- Chỉ tạo reminder `một lần`
- Chỉ dùng kênh `Telegram`
- Chưa hỗ trợ câu tự nhiên như `mai 8h sáng`
- Chưa hỗ trợ `hằng ngày`, `hằng tuần`, `theo thứ`

## 7. Gợi ý test nhanh

1. Tạo token liên kết ở trang `Kênh gửi`
2. Gửi `/start <token>` cho bot
3. Gửi:

```text
/remind 05/07/2026 07:45 Test phase 1
```

4. Gửi `/list`
5. Gửi `/delete <id-prefix>`

## 8. File chính của phase 1

- `src/app/api/channels/telegram-link/route.ts`
- `src/app/api/telegram/webhook/route.ts`
- `src/lib/telegramBot.ts`
- `src/app/channels/ChannelsClient.tsx`
- `migrations/0008_add_telegram_link_support.sql`
