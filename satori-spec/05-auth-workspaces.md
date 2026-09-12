# Satori — Authentication and Workspace Model

## 1. Authentication
Users authenticate through the selected provider.
The application maps the authenticated identity to an internal user record.

## 2. Workspace
A workspace is the primary security and organization boundary.
A workspace can represent a business, school organization, research team, or personal knowledge space.

## 3. Roles
MVP roles:
- owner
- admin
- member

### Owner
Can manage workspace, members, documents, and settings.
### Admin
Can manage documents and workspace operations allowed by policy.
### Member
Can search knowledge, chat, and access documents permitted by workspace policy.

## 4. Authorization Flow
```text
Request
 ↓
Authenticated user?
 ↓ yes
Resolve workspace
 ↓
Check membership/role
 ↓
Execute operation
```

## 5. Client vs Server
The client may request a workspace ID, but the server must confirm membership before using it.
Never trust workspace IDs, document IDs, or user IDs supplied by the browser.

## 6. Document Access
Document visibility is determined by workspace membership plus future per-document permissions if introduced.
MVP assumes all workspace members can access workspace documents unless a later policy explicitly adds document-level ACLs.

## 7. Conversation Access
A user can access only conversations in workspaces where they are a member.

## 8. API Security
Every protected route must verify:
1. authentication
2. workspace membership
3. role when needed
4. resource ownership/visibility

## 9. Session Handling
Use the authentication provider's supported secure session mechanism.
Do not store raw access tokens in browser local storage unless the selected provider explicitly requires a secure implementation.

## 10. Future Enhancements
- invitation links
- domain restrictions
- document-level permissions
- audit log UI
- organization-wide SSO for higher-tier deployments

## 11. Acceptance Rules
A user from Workspace A must never retrieve or cite Workspace B content, even when IDs or search terms overlap.
An unauthorized user must receive a generic not-found/forbidden response rather than data that reveals protected resource details.
