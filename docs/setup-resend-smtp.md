# Setting up Resend as Supabase SMTP provider

This enables reliable email confirmation and password reset for In Character.
Claude Code cannot perform these steps automatically — they require DNS changes in Namecheap
and manual configuration in Resend and Supabase dashboards.

---

## Step 1 — Add your domain in Resend

1. Go to [resend.com](https://resend.com) and sign in (or create a free account)
2. Navigate to **Settings → Domains**
3. Click **Add Domain**
4. Enter `incharacter.cloud` and select your region (EU if available, otherwise US)
5. Resend will show you DNS records to add

## Step 2 — Add DNS records in Namecheap

1. Log into [Namecheap](https://namecheap.com) → Domain List → Manage `incharacter.cloud`
2. Go to **Advanced DNS**
3. Add each record Resend provided — typically:
   - A TXT record for SPF: `v=spf1 include:amazonses.com ~all`
   - A CNAME record for DKIM (e.g. `resend._domainkey` → some-value.dkim.resend.com)
   - A TXT record for DMARC (optional but recommended)
4. Save all records
5. Back in Resend, click **Verify DNS Records** — propagation can take up to 24 hours but is usually minutes

## Step 3 — Create a Resend API key

1. In Resend, go to **API Keys**
2. Click **Create API Key**
3. Name: `In Character SMTP`
4. Permission: **Send access** only (not full access)
5. Copy the key — you won't see it again

## Step 4 — Configure Supabase custom SMTP

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/gjvtcpzsrrivpukzojrp)
2. Navigate to **Settings → Auth**
3. Scroll to **SMTP Settings** and enable **Custom SMTP**
4. Fill in:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** *(paste your Resend API key)*
   - **Sender email:** `noreply@incharacter.cloud`
   - **Sender name:** `In Character`
5. Click **Save**
6. Use the **Send test email** button to verify it works before enabling confirmation

## Step 5 — Re-enable email confirmation in Supabase

1. Still in **Settings → Auth**
2. Under **User Confirmations**, enable **Enable email confirmations**
3. Save

## Step 6 — Set the site URL and redirect URLs

Ensure these are set in **Settings → Auth → URL Configuration**:
- **Site URL:** `https://incharacter.cloud`
- **Redirect URLs:** `https://incharacter.cloud/**`

---

## Verification

After setup:
1. Create a test account at `/auth/login` (Sign Up tab)
2. Check that a confirmation email arrives from `noreply@incharacter.cloud`
3. Click the confirmation link — should redirect to `/auth/login?confirmed=true`
4. Sign in with the confirmed account

If email doesn't arrive, check Resend's **Logs** dashboard for delivery status.
