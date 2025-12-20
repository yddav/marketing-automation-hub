# Email Infrastructure Environment Variables

## Required for Netlify Functions

Add these to Netlify Dashboard → Site settings → Environment variables

### Supabase Configuration (SAME PROJECT AS FINDERR APP)
```
# Use the SAME Supabase project as FINDERR app
# Project ID: zdceeulkqfpzdjeyekgs
# Region: eu-west-3

SUPABASE_URL=https://zdceeulkqfpzdjeyekgs.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**Why Same Project?**
✅ Unified user data across marketing and app
✅ Marketing emails can reference app activity
✅ Single database = simpler management
✅ RLS policies prevent data conflicts

### Email Provider - Resend (Primary)
```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_resend_api_key_here
```

### Email Provider - Brevo (Migration Ready)
```
# Uncomment when switching to Brevo:
# EMAIL_PROVIDER=brevo
# BREVO_API_KEY=xkeysib-your_brevo_api_key_here
```

### Email Configuration
```
EMAIL_FROM_ADDRESS=finderr@hub.untrapd.com
EMAIL_FROM_NAME=FINDERR Team
EMAIL_REPLY_TO=support@untrapd.com
```

### Application Settings
```
NODE_ENV=production
NETLIFY_URL=https://hub.untrapd.com
```

## How to Get API Keys

### Resend (3,000 emails/month FREE)
1. Go to https://resend.com/signup
2. No credit card required
3. Verify your sending domain (hub.untrapd.com)
4. Copy API key from Dashboard → API Keys

### Brevo (9,000 emails/month FREE - for future)
1. Go to https://app.brevo.com/account/register
2. No credit card required
3. Verify your sending domain
4. Copy API key from Settings → SMTP & API → API Keys

## Provider Switching

To switch from Resend to Brevo:
1. Set `EMAIL_PROVIDER=brevo` in Netlify environment variables
2. Add `BREVO_API_KEY` with your Brevo API key
3. No code changes required - abstraction layer handles everything

## Testing Configuration

For local testing, create a `.env` file:
```bash
SUPABASE_URL=https://zdceeulkqfpzdjeyekgs.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_test_api_key
NETLIFY_URL=http://localhost:8888
NODE_ENV=development
```

## Security Notes

- Never commit API keys to version control
- Use Netlify's environment variable management
- Rotate API keys periodically
- Monitor provider dashboards for suspicious activity
- Keep SERVICE_KEY secure (has full database access)
