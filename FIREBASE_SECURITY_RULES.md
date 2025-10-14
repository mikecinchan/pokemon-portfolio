# Firebase Security Rules for Pokemon Portfolio Tracker

## Overview
These security rules ensure that only authenticated users can access their own investment data.

## Firestore Security Rules

### Implementation Steps

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pokemon-portfolio-dfcf4**
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the rules below
5. Click **Publish**

### Security Rules Code

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Investments collection - users can only access their own investments
    match /investments/{investmentId} {
      // Allow read if user is authenticated and owns the document
      allow read: if isAuthenticated() &&
                     isOwner(resource.data.userId);

      // Allow create if user is authenticated and userId in document matches auth uid
      allow create: if isAuthenticated() &&
                       isOwner(request.resource.data.userId);

      // Allow update if user is authenticated, owns the document, and userId doesn't change
      allow update: if isAuthenticated() &&
                       isOwner(resource.data.userId) &&
                       isOwner(request.resource.data.userId);

      // Allow delete if user is authenticated and owns the document
      allow delete: if isAuthenticated() &&
                       isOwner(resource.data.userId);
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Rule Explanation

### Authentication Check
```javascript
function isAuthenticated() {
  return request.auth != null;
}
```
- Ensures the user is logged in with Firebase Authentication
- Returns `true` if user has a valid auth token

### Ownership Check
```javascript
function isOwner(userId) {
  return request.auth.uid == userId;
}
```
- Verifies that the authenticated user's UID matches the document's userId
- Prevents users from accessing other users' data

### Investments Collection Rules

**Read Operations:**
```javascript
allow read: if isAuthenticated() && isOwner(resource.data.userId);
```
- Users can only read their own investment documents
- `resource.data` refers to the existing document in Firestore

**Create Operations:**
```javascript
allow create: if isAuthenticated() && isOwner(request.resource.data.userId);
```
- Users can create new investments
- The userId in the new document must match their authenticated UID
- `request.resource.data` refers to the document being created

**Update Operations:**
```javascript
allow update: if isAuthenticated() &&
                 isOwner(resource.data.userId) &&
                 isOwner(request.resource.data.userId);
```
- Users can only update their own investments
- Prevents changing the userId field to someone else's ID

**Delete Operations:**
```javascript
allow delete: if isAuthenticated() && isOwner(resource.data.userId);
```
- Users can only delete their own investments

## Testing the Rules

### Using Firebase Console

1. Go to **Firestore Database** → **Rules** tab
2. Click **Rules Playground**
3. Test various scenarios:

**Test Read (Should SUCCEED):**
```
Location: /investments/abc123
Authenticated: Yes
Auth UID: user123
Document data: { userId: "user123", ... }
Result: ✅ Allow
```

**Test Read (Should FAIL):**
```
Location: /investments/abc123
Authenticated: Yes
Auth UID: user456
Document data: { userId: "user123", ... }
Result: ❌ Deny (Different user trying to access)
```

**Test Create (Should SUCCEED):**
```
Location: /investments/new123
Authenticated: Yes
Auth UID: user123
Request data: { userId: "user123", tokenTicker: "BTC", ... }
Result: ✅ Allow
```

**Test Create (Should FAIL):**
```
Location: /investments/new123
Authenticated: Yes
Auth UID: user123
Request data: { userId: "user456", tokenTicker: "BTC", ... }
Result: ❌ Deny (Trying to create for different user)
```

## Development vs Production Rules

### Development Rules (Current)
The rules above are suitable for development and production.

### Additional Production Considerations

1. **Add Field Validation:**
```javascript
allow create: if isAuthenticated() &&
                 isOwner(request.resource.data.userId) &&
                 request.resource.data.tokenTicker is string &&
                 request.resource.data.tokenAmount is number &&
                 request.resource.data.tokenAmount > 0;
```

2. **Rate Limiting:**
Firebase automatically provides some rate limiting, but consider:
- Implementing application-level rate limiting
- Using Firebase App Check for additional security

3. **Add Indexes:**
Create composite indexes for queries:
- Collection: `investments`
- Fields: `userId` (Ascending), `createdAt` (Descending)

## Common Issues & Solutions

### Issue: "Missing or insufficient permissions"
**Solution:**
- Ensure user is logged in
- Check that userId in document matches authenticated user
- Verify rules are published in Firebase Console

### Issue: "Query requires an index"
**Solution:**
- Firebase will show a link to create the required index
- Click the link or manually create in Firebase Console

### Issue: "Rules don't seem to apply"
**Solution:**
- Wait 1-2 minutes after publishing rules
- Clear browser cache and reload
- Check Firebase Console for rule syntax errors

## Security Best Practices

1. **Never Trust Client Data**
   - Always validate userId server-side (done in our backend)
   - Use security rules as a second layer of defense

2. **Principle of Least Privilege**
   - Only grant minimum necessary permissions
   - Deny by default (last rule in our config)

3. **Regular Audits**
   - Review Firebase Console → **Firestore → Usage** tab
   - Check for suspicious access patterns

4. **Enable Firebase App Check** (Production)
   - Protects against abuse from unauthorized clients
   - Add in Firebase Console → App Check

## Monitoring & Logging

### Enable Audit Logs
1. Go to Firebase Console
2. Navigate to **Firestore → Monitor** tab
3. Enable audit logging
4. Set up alerts for:
   - Permission denied errors
   - Unusual access patterns
   - High read/write volumes

## Migration Notes

If you already have data in Firestore without userId fields:

1. **Option 1: Delete old data** (if test data):
   ```bash
   # In Firebase Console → Firestore → Data tab
   # Manually delete all documents in investments collection
   ```

2. **Option 2: Migrate existing data**:
   - Create a migration script to add userId to existing documents
   - Temporarily relax rules during migration
   - Re-enable strict rules after migration

## Contact & Support

For questions about these security rules:
- Firebase Security Rules Documentation: https://firebase.google.com/docs/rules
- Firebase Console: https://console.firebase.google.com/

---

**Last Updated:** October 14, 2025
**Applies to Project:** pokemon-portfolio-dfcf4
