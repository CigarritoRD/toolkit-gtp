# Email Templates for Supabase Dashboard

These templates go in:
**Supabase Dashboard → Authentication → Email Templates**

---

## 1. Confirm Signup

### Subject
```
Confirm your Toolkit account
```

### HTML Body
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your account</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" width="100%" max-width="520px" style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#007473;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">GTP Toolkit</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#1a2b3c;font-size:22px;font-weight:700;">Confirm your account</h2>
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                Thanks for joining Toolkit! Please confirm your email address to activate your account and start accessing educational resources.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:0 0 24px;text-align:center;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;background-color:#007473;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;">
                      Confirm my account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0;color:#4a5568;font-size:13px;text-align:center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color:#007473;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 8px;color:#4a5568;font-size:13px;text-align:center;">
                If you didn't create this account, you can safely ignore this message.
              </p>
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                This link expires in 60 minutes.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Reset Password

### Subject
```
Reset your Toolkit password
```

### HTML Body
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" width="100%" max-width="520px" style="max-width:520px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#007473;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">GTP Toolkit</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#1a2b3c;font-size:22px;font-weight:700;">Reset your password</h2>
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                We received a request to reset your Toolkit password. Click the button below to create a new one.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:0 0 24px;text-align:center;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;background-color:#007473;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;">
                      Create new password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0;color:#4a5568;font-size:13px;text-align:center;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color:#007473;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;">
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 8px;color:#4a5568;font-size:13px;text-align:center;">
                If you didn't request this change, ignore this email. Your current password remains active.
              </p>
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                This link expires in 60 minutes.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Important Notes

### Available variables in Supabase
| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | Full URL with token to confirm/reset |
| `{{ .Token }}` | Raw token |
| `{{ .TokenHash }}` | Hashed token |
| `{{ .SiteURL }}` | Base URL configured in Supabase |
| `{{ .Email }}` | User's email |
| `{{ .RedirectTo }}` | Redirect URL configured |

### Colors used
- Primary (header/background): `#007473`
- White (button text): `#ffffff`
- Dark (headings): `#1a2b3c`
- Body text: `#4a5568`
- Muted: `#a0aec0`
- Background: `#f5f7fa`

### Supabase Configuration

1. **Site URL**
   - Production: `https://your-domain.com`
   - Development: `http://localhost:5173`

2. **Redirect URLs** (Authentication → URL Configuration → Redirect URLs)
   ```
   https://your-domain.com/auth/confirm
   https://your-domain.com/reset-password
   http://localhost:5173/auth/confirm
   http://localhost:5173/reset-password
   ```

### SMTP (recommended for production)

To have a professional sender (not "supabase.co" or similar), configure SMTP in:
**Authentication → SMTP Settings**

Recommended providers:
- **Resend** (simplest, generous free tier)
- **Postmark**
- **Brevo** (formerly Sendinblue)
- **Amazon SES**

### Next steps
1. Copy the HTML templates above to Supabase Dashboard
2. Personalize `{{ .ConfirmationURL }}` in templates if using custom SMTP
3. Configure SMTP for professional sender
4. Add Redirect URLs in Supabase
5. Test the full registration and password reset flow