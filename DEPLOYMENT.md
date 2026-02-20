# Web Boss - Deployment Guide

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All SQL migrations run successfully
- [ ] RLS policies tested and verified
- [ ] Environment variables configured
- [ ] Storage bucket created
- [ ] Test accounts created
- [ ] Error tracking configured
- [ ] Analytics verified
- [ ] Security audit complete

---

## 🌐 Environment Setup

### Supabase Production Project

1. **Create Production Project**
   - Separate from development
   - Enable all required services
   - Configure custom domain (optional)

2. **Run Migrations**
   ```sql
   -- In Supabase SQL Editor
   -- Run schema.sql
   -- Run schema-rls.sql
   ```

3. **Configure Environment Variables**
   ```
   SUPABASE_URL=https://[PROJECT_ID].supabase.co
   SUPABASE_ANON_KEY=[your_anon_key]
   SUPABASE_SERVICE_ROLE_KEY=[your_service_key]
   ```

4. **Enable Auth Providers**
   - Email/Password: ✅ Enabled
   - Google OAuth: ⚠️ Configure if needed
   - Facebook OAuth: ⚠️ Configure if needed

---

## 🔐 Security Configuration

### Auth Settings

1. **Email Templates**
   - Customize confirmation email
   - Customize password reset email
   - Add company branding

2. **Site URL**
   ```
   Site URL: https://webboss.com.ng
   Redirect URLs: 
   - https://webboss.com.ng/auth/callback
   - http://localhost:3000/auth/callback (dev)
   ```

3. **JWT Expiry**
   - Access token: 1 hour (default)
   - Refresh token: 30 days (default)

### Database

1. **Connection Pooling**
   - Enable for production
   - Configure pool size based on load

2. **Backups**
   - Enable automatic daily backups
   - Test restore procedure
   - Document recovery process

3. **Monitoring**
   - Enable query performance monitoring
   - Set up alerts for slow queries
   - Monitor connection count

---

## 🗄️ Storage Configuration

### Bucket Policies

The server auto-creates the bucket, but verify:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets 
WHERE name = 'avatars-webboss-49cc7ee6';

-- Verify policies
SELECT * FROM storage.policies 
WHERE bucket_id = 'avatars-webboss-49cc7ee6';
```

### File Size Limits

- Avatar uploads: 5MB max
- Supported formats: PNG, JPEG, JPG, GIF, WebP

### CDN Configuration (Optional)

- Use Supabase CDN (built-in)
- Or configure Cloudflare for additional caching

---

## 📊 Analytics & Monitoring

### Application Monitoring

1. **Supabase Dashboard**
   - Monitor auth metrics
   - Track database performance
   - View API usage

2. **Error Tracking** (Recommended)
   - Sentry integration
   - Log server errors
   - Track client-side errors

3. **Performance Monitoring**
   - Core Web Vitals
   - Page load times
   - API response times

### Business Metrics

Track in separate analytics tool:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Conversion rate (Free → Pro)
- Churn rate
- MRR (Monthly Recurring Revenue)

---

## 🔧 Edge Functions Deployment

### Server Configuration

The server is already configured in `/supabase/functions/server/index.tsx`

### Environment Variables (Server-Side)

Automatically available in Edge Functions:
```typescript
Deno.env.get('SUPABASE_URL')
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
Deno.env.get('SUPABASE_ANON_KEY')
```

### Deployment

Edge Functions deploy automatically when you push to Supabase.

**Manual deployment:**
```bash
npx supabase functions deploy make-server-49cc7ee6
```

---

## 🌍 Custom Domain (Optional)

### Supabase Project Domain

1. Go to Project Settings → Custom Domains
2. Add your domain: `webboss.com.ng`
3. Configure DNS records:
   ```
   Type: CNAME
   Name: @
   Value: [provided-by-supabase]
   ```

### Page Custom Domains

For user custom domains:
1. Store domain in `pages.custom_domain`
2. Verify DNS configuration (not yet implemented)
3. Issue SSL certificate (Cloudflare recommended)
4. Route traffic to Supabase

---

## 🔒 SSL/HTTPS

- ✅ Supabase provides SSL by default
- ✅ All API calls are HTTPS
- ✅ Storage URLs are HTTPS

For custom domains:
- Use Cloudflare for free SSL
- Or configure Let's Encrypt

---

## 💳 Payment Integration (Future)

### Paystack Setup

1. Create Paystack account
2. Get API keys (test + live)
3. Configure webhook endpoint
4. Test payment flow
5. Enable live mode

**Environment Variables:**
```
PAYSTACK_PUBLIC_KEY=[your_public_key]
PAYSTACK_SECRET_KEY=[your_secret_key]
```

---

## 📧 Email Configuration

### Transactional Emails

**Options:**
1. **Supabase Auth Emails** (built-in)
   - Signup confirmations
   - Password resets
   - Magic links

2. **SendGrid** (recommended for custom emails)
   - Welcome emails
   - Weekly reports
   - Upgrade prompts

3. **Mailgun** (alternative)
   - Similar to SendGrid
   - Good deliverability

### Email Templates Needed

- [ ] Welcome email
- [ ] Password reset
- [ ] Payment confirmation
- [ ] Weekly analytics report
- [ ] Upgrade prompts
- [ ] Churn prevention

---

## 🚨 Incident Response

### Runbook

**Database Down:**
1. Check Supabase status page
2. Verify connection strings
3. Check RLS policies
4. Contact Supabase support

**Auth Issues:**
1. Check auth service status
2. Verify JWT tokens
3. Check redirect URLs
4. Review auth logs

**Storage Issues:**
1. Check bucket exists
2. Verify storage policies
3. Check file size limits
4. Review storage logs

### Rollback Procedure

1. Revert to last known good migration
2. Restore database from backup
3. Redeploy previous Edge Function version
4. Notify users of downtime

---

## 📈 Scaling Considerations

### Database Scaling

**Current Plan:** Free/Pro tier
**Upgrade when:**
- \> 10,000 users
- \> 1M analytics events
- Slow query performance

**Optimization:**
- Add indexes on frequently queried columns
- Partition analytics_events table by date
- Archive old analytics data

### API Scaling

**Edge Functions scale automatically**
- No configuration needed
- Pay per invocation

**Consider:**
- Caching frequently accessed data
- Rate limiting to prevent abuse
- CDN for static assets

### Storage Scaling

**Current:** Included in Supabase plan
**Upgrade when:**
- \> 100GB storage used
- \> 1M requests/month

---

## 🧪 Pre-Launch Testing

### Load Testing

**Test scenarios:**
1. 100 concurrent users
2. 1000 page views/minute
3. 100 uploads/hour
4. Analytics queries under load

**Tools:**
- Artillery
- k6
- Apache JMeter

### Security Testing

**Checklist:**
- [ ] SQL injection tests
- [ ] XSS vulnerability scan
- [ ] CSRF protection verified
- [ ] RLS bypass attempts (should fail)
- [ ] File upload exploits (size, type)
- [ ] Rate limiting tested

### User Acceptance Testing

**Test all user flows:**
- [ ] Signup → Onboarding → First page
- [ ] Create block → Publish → View
- [ ] Analytics tracking works
- [ ] Avatar upload works
- [ ] Password reset works

---

## 📝 Launch Day Checklist

### Technical

- [ ] Production database ready
- [ ] RLS policies verified
- [ ] Edge Functions deployed
- [ ] Environment variables set
- [ ] Error tracking enabled
- [ ] Monitoring configured
- [ ] Backups enabled

### Content

- [ ] Landing page copy finalized
- [ ] Pricing page clear
- [ ] Terms of Service live
- [ ] Privacy Policy live
- [ ] Help documentation available

### Marketing

- [ ] Social media accounts ready
- [ ] Launch announcement prepared
- [ ] Email list ready (if any)
- [ ] Support email configured
- [ ] FAQ page created

### Support

- [ ] Support email: support@webboss.com.ng
- [ ] Response time SLA defined
- [ ] Known issues documented
- [ ] Escalation procedure ready

---

## 🎯 Post-Launch Monitoring

### First 24 Hours

Monitor:
- [ ] Signups (target: 50+)
- [ ] Error rate (target: <1%)
- [ ] Page load time (target: <2s)
- [ ] Database performance
- [ ] Server uptime

### First Week

Track:
- [ ] User retention (D1, D3, D7)
- [ ] Published pages count
- [ ] Support tickets
- [ ] Payment conversions (when enabled)
- [ ] Bug reports

### First Month

Analyze:
- [ ] User growth trend
- [ ] Feature usage
- [ ] Churn rate
- [ ] Revenue (when payments enabled)
- [ ] User feedback

---

## 🔄 Continuous Deployment

### Development Workflow

```
Development → Staging → Production

1. Develop feature in dev branch
2. Test in staging environment
3. Merge to main
4. Deploy to production
5. Monitor for issues
```

### Database Migrations

**Process:**
1. Write migration SQL
2. Test on staging database
3. Backup production database
4. Run migration on production
5. Verify success
6. Document changes

**Rollback Plan:**
- Keep previous schema backup
- Test rollback procedure
- Document rollback SQL

---

## 📊 Performance Targets

### Page Load Times
- Landing page: <2s
- Dashboard: <3s
- Public profile: <1s
- Analytics page: <4s

### API Response Times
- Auth endpoints: <500ms
- Handle check: <200ms
- Analytics query: <1s
- File upload: <2s

### Database Queries
- Simple queries: <100ms
- Complex joins: <500ms
- Analytics aggregation: <1s

---

## 🎓 Team Training

### For Developers

- Supabase architecture overview
- RLS policies explanation
- Edge Functions debugging
- Database query optimization

### For Support

- Common user issues
- Password reset process
- Account recovery
- Feature explanations

### For Sales/Marketing

- Product features
- Pricing structure
- Competitive advantages
- Target customer profile

---

## 📞 Support Contacts

**Supabase Support:**
- Dashboard: app.supabase.com/support
- Email: support@supabase.io
- Discord: supabase.com/discord

**Emergency Contacts:**
- Technical lead: [your_contact]
- Database admin: [your_contact]
- Support lead: [your_contact]

---

## ✅ Go-Live Sign-Off

**Before going live, confirm:**

- [ ] All migrations run successfully
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Backup/restore tested
- [ ] Monitoring configured
- [ ] Support ready
- [ ] Marketing ready
- [ ] Legal docs ready (Terms, Privacy)

**Sign-off:**
- [ ] Technical Lead: _______________
- [ ] Product Manager: _______________
- [ ] Security Officer: _______________

---

## 🚀 Launch!

Once all checks pass:

1. Switch DNS to production
2. Monitor metrics closely
3. Be ready to respond to issues
4. Celebrate! 🎉

**Welcome to production, Web Boss!** 🇳🇬

---

For questions: devops@webboss.com.ng
