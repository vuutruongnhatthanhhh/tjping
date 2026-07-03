# Cau hinh cron-job.org cho TJPing

## 1. Chay migration moi nhat tren Supabase

Can chay them file:

- `migrations/0005_add_delivery_processing_support.sql`

File nay bo sung du lieu de:

- tranh gui trung cung mot moc nhac
- luu log gui theo tung kenh
- ho tro worker cron xu ly reminder den han

## 2. Them environment variables tren Vercel

Vao project tren Vercel, them day du cac bien sau:

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Gmail OAuth2

- `GMAIL_OAUTH_USER`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`

### Telegram

- `TELEGRAM_BOT_TOKEN`

### Cron

- `CRON_SECRET`

Khuyen nghi:

- `CRON_SECRET` dung chuoi dai, kho doan, vi du 32-64 ky tu.
- Khong dung gia tri ngan nhu `123456`.

## 3. Deploy lai project

Sau khi them env va chay migration, deploy lai project len Vercel.

Cron cua app se duoc goi qua endpoint:

- `https://ten-domain-cua-anh/api/cron/send-reminders`

## 4. Tao cron job tren cron-job.org

Vao:

- `https://cron-job.org/en/`

Sau do tao 1 job moi voi cau hinh:

### URL

```text
https://ten-domain-cua-anh/api/cron/send-reminders
```

### Method

```text
GET
```

### Schedule

```text
Every 1 minute
```

### Header

Them custom header:

```text
Authorization: Bearer CRON_SECRET_CUA_ANH
```

Vi du:

```text
Authorization: Bearer tjping_prod_secret_2026_xxxxxxxxxxxx
```

## 5. Test thu cong truoc khi bat cron

Truoc khi de cron-job.org chay that, nen test endpoint bang tay.

### Cach 1: tren trinh duyet API client hoac Postman

Goi:

```text
GET https://ten-domain-cua-anh/api/cron/send-reminders
```

Kem header:

```text
Authorization: Bearer CRON_SECRET_CUA_ANH
```

### Cach 2: dung curl

```bash
curl -X GET "https://ten-domain-cua-anh/api/cron/send-reminders" ^
  -H "Authorization: Bearer CRON_SECRET_CUA_ANH"
```

Neu thanh cong, API se tra JSON dang:

```json
{
  "success": true,
  "scannedSteps": 0,
  "processedSteps": 0,
  "sentLogs": 0,
  "failedLogs": 0,
  "skippedSteps": 0,
  "processedAt": "2026-07-03T00:00:00.000Z"
}
```

## 6. Cach tu test reminder

De test nhanh:

1. Vao trang `/channels`
2. Bat Email hoac Telegram
3. Luu cau hinh
4. Tao 1 reminder moi sau 2-3 phut
5. Chon moc nhac `Dung gio`
6. Cho cron chay

Neu dung Email:

- Can dam bao Gmail OAuth2 dang hop le

Neu dung Telegram:

- User da nhan `/start` cho bot
- `telegram_chat_id` hoac `telegram_username` da luu dung
- `TELEGRAM_BOT_TOKEN` dung voi bot dang hien thi trong app

## 7. Cach kiem tra khi khong gui duoc

Kiem tra lan luot:

1. Vercel env da du chua
2. `CRON_SECRET` trong cron-job.org co trung voi Vercel khong
3. Migration `0005` da chay chua
4. Telegram bot co nhan duoc `/start` tu user chua
5. Gmail OAuth2 token con hieu luc khong
6. Reminder co moc nhac `pending` va da den gio chua

## 8. Ghi chu ve Vercel Free

Project nay hien dang bo cron cua Vercel vi:

- Goi Free cua Vercel khong ho tro cron moi phut
- Neu de `vercel.json` cron moi phut thi deploy se fail

Vi vay scheduler ngoai se la:

- `cron-job.org`

Con backend xu ly reminder van nam trong app TJPing.
