# Railway Deployment Guide

## Environment Variables Required

Set these in your Railway project settings:

### Required Variables:
- `MAILER_HOST` - SMTP server hostname (e.g., `smtp.gmail.com`, `smtp.mailgun.org`)
- `MAILER_PORT` - SMTP port (usually `587` for TLS or `465` for SSL)
- `MAILER_AUTH_USER` - SMTP username/email
- `MAILER_AUTH_PASS` - SMTP password or app-specific password
- `MAILER_FROM` - Sender email address
- `MAILER_TO` - Primary recipient email
- `TEMPLATE_PATH` - Path to email templates (e.g., `./src/template`)

### Optional Variables:
- `MAILER_CC` - Comma-separated CC recipients (e.g., `email1@example.com,email2@example.com`)
- `MAILER_IGNORE_TLS` - Set to `"true"` if your SMTP doesn't use TLS
- `MAILER_SECURE` - Set to `"true"` for SSL connections (port 465)
- `MAILER_REJECT_UNAUTHORIZED` - Set to `"false"` to allow self-signed certificates
- `PORT` - Railway sets this automatically

## Common SMTP Providers

### Gmail:
```
MAILER_HOST=smtp.gmail.com
MAILER_PORT=587
MAILER_SECURE=false
MAILER_IGNORE_TLS=false
```
**Note:** You need to use an App Password, not your regular Gmail password.

### Mailgun:
```
MAILER_HOST=smtp.mailgun.org
MAILER_PORT=587
MAILER_SECURE=false
```

### SendGrid:
```
MAILER_HOST=smtp.sendgrid.net
MAILER_PORT=587
MAILER_SECURE=false
```

## Troubleshooting Connection Timeout

If you see "Connection timeout" errors:

1. **Verify SMTP credentials** - Double-check username and password
2. **Check port and security settings** - Ensure port matches security type (587 for TLS, 465 for SSL)
3. **Test SMTP connection** - Use a tool like `telnet` or `nc` to test connectivity
4. **Check Railway network** - Ensure Railway allows outbound connections on the SMTP port
5. **Firewall rules** - Some SMTP providers require whitelisting Railway's IP ranges

## Note on Verification Error

The "Error occurred while verifying the transporter" message during startup is expected and won't prevent the service from working. The connection will be verified when actually sending emails. This is normal behavior to avoid blocking application startup.

