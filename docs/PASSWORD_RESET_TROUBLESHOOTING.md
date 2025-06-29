# Password Reset Flow - Troubleshooting Guide

## Overview
This document provides comprehensive troubleshooting information for the password reset flow in PaySlip Pro, including common issues, debugging steps, and solutions.

## Common Issues and Solutions

### 1. "Password reset token has expired" Error

#### Symptoms
- User receives `otp_expired` error when trying to reset password
- Error occurs after clicking the reset link and attempting to change password
- Console shows `AuthApiError: Email link is invalid or has expired`

#### Root Causes
1. **Time Expiration**: Token validity period (default 1 hour) has elapsed
2. **Multiple Reset Requests**: User requested multiple reset links, invalidating previous ones
3. **Delayed Processing**: User took too long between steps in the reset flow

#### Solutions
1. **Request a New Reset Link**: Most common solution - user should request a fresh reset email
2. **Complete Process Quickly**: Users should complete the entire flow within the token validity period
3. **Use Latest Link**: If multiple emails were sent, only use the most recent one

### 2. Token Validation Issues

#### Debug Information
The reset password page now includes enhanced logging:

```typescript
// Token validation check
console.log('Token validation check:', {
  verified,
  hasTokenHash: !!tokenHash,
  type,
  timestamp: new Date().toISOString()
})

// Session establishment
console.log('Using verifyOtp with token_hash for password recovery', {
  tokenHashPreview: `${tokenHash.substring(0, 8)}...`,
  timestamp: new Date().toISOString()
})
```

#### Expected Flow
1. User clicks reset link from email
2. Redirected to `/auth/confirm` (server-side route)
3. Redirected to `/auth/confirm-reset` (intermediate confirmation)
4. User clicks "Confirm Password Reset"
5. Redirected to `/auth/reset-password?token_hash=...&type=recovery&verified=true`
6. User enters new password and submits
7. `verifyOtp` is called to establish session
8. `updateUser` is called to change password

### 3. URL Parameter Issues

#### Required Parameters
For the reset password page to work, these URL parameters must be present:
- `token_hash`: The actual reset token from Supabase
- `type=recovery`: Indicates this is a password recovery flow
- `verified=true`: Confirms user went through intermediate confirmation

#### Invalid Parameter Scenarios
- Missing `token_hash`: User will see "Invalid reset link" error
- Missing `verified=true`: Prevents form from showing
- Wrong `type`: Token validation will fail

### 4. Session Establishment Failures

#### Common Error Messages
- `"Email link is invalid or has expired"`: Token is expired or already used
- `"Invalid token format"`: Token parameter is malformed
- `"Password reset session could not be established"`: Generic session error

#### Debugging Steps
1. Check browser console for detailed error logs
2. Verify URL parameters are correctly formatted
3. Confirm token hasn't been used already
4. Check if multiple reset requests were made

## User Experience Improvements

### 1. Enhanced Error Messages
The reset password page now provides specific error messages:
- Token expiration with clear next steps
- Invalid token with request new link option
- Session establishment failures with helpful guidance

### 2. Quick Recovery Options
When token expires, users see:
- Clear error explanation
- "Request New Reset Link" button
- Direct link to forgot password page

### 3. Educational Content
The forgot password success page now includes:
- Token validity period (1 hour)
- Warning about multiple requests
- Reminder to check spam folder
- Instruction to complete process promptly

## Technical Implementation Details

### Token Flow Architecture
```
Email Link → /auth/confirm → /auth/confirm-reset → /auth/reset-password
     ↓              ↓                ↓                    ↓
Extract token → Pass to client → User confirms → Validate & update
```

### Security Measures
1. **Two-step confirmation**: Prevents email prefetching from consuming tokens
2. **Token validation**: Strict parameter checking before showing form
3. **Session establishment**: Proper authentication before password update
4. **Error handling**: Secure error messages that don't leak sensitive information

### Supabase Configuration
- **Token Expiry**: Default 1 hour (3600 seconds)
- **Redirect URL**: Set to `/auth/confirm` in Supabase dashboard
- **Email Template**: Can be customized in Supabase dashboard

## Monitoring and Debugging

### Console Logs
The implementation includes comprehensive logging:
- Token parameter validation
- Session establishment attempts
- Error details with timestamps
- Success confirmations

### Error Tracking
Key error scenarios are logged:
- Token expiration events
- Invalid token attempts
- Session establishment failures
- Password update errors

## Best Practices for Users

### For End Users
1. **Act Quickly**: Complete the reset process within 1 hour
2. **Use Latest Link**: If you request multiple emails, use the most recent one
3. **Check Spam**: Reset emails might end up in spam folder
4. **Single Browser**: Complete the entire process in the same browser session

### For Administrators
1. **Monitor Error Rates**: Track password reset failure rates
2. **User Education**: Inform users about token expiration
3. **Support Documentation**: Provide clear instructions for common issues
4. **Email Delivery**: Ensure reset emails are delivered reliably

## Configuration Checklist

### Supabase Settings
- [ ] Redirect URL configured: `${SITE_URL}/auth/confirm`
- [ ] Token expiry set appropriately (recommended: 3600 seconds)
- [ ] Email templates customized if needed
- [ ] SMTP configuration verified

### Application Settings
- [ ] Environment variables configured
- [ ] Error handling implemented
- [ ] Logging enabled for debugging
- [ ] User feedback mechanisms in place

## Troubleshooting Checklist

When users report password reset issues:

1. **Verify Email Delivery**
   - [ ] Check if reset email was sent
   - [ ] Verify email isn't in spam folder
   - [ ] Confirm email address is correct

2. **Check Token Status**
   - [ ] Verify token hasn't expired (check timestamp)
   - [ ] Confirm no newer tokens were issued
   - [ ] Validate token format in URL

3. **Review User Actions**
   - [ ] Confirm user clicked correct link
   - [ ] Check if user completed intermediate confirmation
   - [ ] Verify user is using same browser/device

4. **Technical Verification**
   - [ ] Check browser console for errors
   - [ ] Verify URL parameters are correct
   - [ ] Confirm Supabase configuration
   - [ ] Test with fresh reset request

## Contact and Support

If issues persist after following this guide:
1. Check browser console for detailed error logs
2. Verify Supabase project configuration
3. Test with a fresh password reset request
4. Contact technical support with specific error details