# Email Templates para Supabase Dashboard

Estos templates van en:
**Supabase Dashboard → Authentication → Email Templates**

---

## 1. Confirm Signup (Confirmación de cuenta)

### Subject
```
Confirma tu cuenta en Toolkit
```

### HTML Body
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu cuenta</title>
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
              <h2 style="margin:0 0 16px;color:#1a2b3c;font-size:22px;font-weight:700;">¡Confirma tu cuenta!</h2>
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                Hola, gracias por unirte a Toolkit. Para activar tu cuenta y acceder a recursos educativos, confirma tu correo electrónico haciendo clic en el botón de abajo.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:0 0 24px;text-align:center;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;background-color:#007473;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;">
                      Confirmar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0;color:#4a5568;font-size:13px;text-align:center;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
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
                Si no creaste esta cuenta, puedes ignorar este mensaje.
              </p>
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                Este enlace expira en 60 minutos.
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

## 2. Reset Password (Restablecer contraseña)

### Subject
```
Restablece tu contraseña en Toolkit
```

### HTML Body
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña</title>
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
              <h2 style="margin:0 0 16px;color:#1a2b3c;font-size:22px;font-weight:700;">Restablecer contraseña</h2>
              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Toolkit. Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:0 0 24px;text-align:center;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;background-color:#007473;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;">
                      Crear nueva contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0;color:#4a5568;font-size:13px;text-align:center;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
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
                Si no fuiste tú quien solicitó el cambio, ignora este correo. Tu contraseña actual seguirá vigente.
              </p>
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;">
                Este enlace expira en 60 minutos.
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

## Notas Importantes

### Variables disponibles en Supabase
| Variable | Descripción |
|----------|-------------|
| `{{ .ConfirmationURL }}` | URL completa con token para confirmar/cambiar contraseña |
| `{{ .Token }}` | Token crudo |
| `{{ .TokenHash }}` | Token hasheado |
| `{{ .SiteURL }}` | URL base configurada en Supabase |
| `{{ .Email }}` | Email del usuario |
| `{{ .RedirectTo }}` | URL de redirección configurada |

### Colores usados
- Primary (header/fondo): `#007473`
- White (texto botón): `#ffffff`
- Dark (títulos): `#1a2b3c`
- Body text: `#4a5568`
- Muted: `#a0aec0`
- Background: `#f5f7fa`

### Configuración necesaria en Supabase

1. **Site URL**
   - Production: `https://tu-dominio.com`
   - Development: `http://localhost:5173`

2. **Redirect URLs** (en Authentication → URL Configuration → Redirect URLs)
   ```
   https://tu-dominio.com/auth/confirm
   https://tu-dominio.com/reset-password
   http://localhost:5173/auth/confirm
   http://localhost:5173/reset-password
   ```

### SMTP propio (recomendado para producción)

Para que el remitente se vea profesional (no "supabase.co" o similar), configura SMTP en:
**Authentication → SMTP Settings**

Proveedores recomendados:
- **Resend** (el más simple, tier gratuito generoso)
- **Postmark**
- **Brevo** (antes Sendinblue)
- **Amazon SES**

### Próximos pasos
1. Copiar los templates HTML a Supabase Dashboard
2. Personalizar el `{{ .ConfirmationURL }}` en los templates si usas SMTP
3. Configurar SMTP propio para remitente profesional
4. Agregar las Redirect URLs en Supabase
5. Probar el flujo completo de registro y confirmación