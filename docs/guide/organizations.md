# Organizations

An organization is the top-level owner of everything in Mujarrad. Think of it like a GitHub account.

## Organization Types

| Type | Description |
|------|-------------|
| **INDIVIDUAL** | Auto-created for every user at signup. One person. Your personal workspace. |
| **TEAM** | Created manually. Multiple members with roles. For collaboration. |

You always have your INDIVIDUAL organization. You can also create or join TEAM organizations.

## Organization Roles

| Role | What you can do |
|------|----------------|
| **OWNER** | Everything — manage members, manage spaces, delete the organization |
| **ADMIN** | Manage members + spaces, but cannot delete the organization |
| **MEMBER** | Use spaces according to their space-level permissions |

## How It Works

```
You sign up
  → INDIVIDUAL organization auto-created (you are the OWNER)
  → A hidden meta-space is created (for system data)
  → You can now create spaces under your organization

You create a team
  → POST /api/organizations { "name": "My Team" }
  → TEAM organization created (you are the OWNER)
  → Invite members: POST /api/organizations/{id}/members
```

## Auto-Creation on Signup

When a user registers:

1. An INDIVIDUAL organization is automatically created
2. The user becomes the OWNER
3. A hidden meta-space is created for system infrastructure
4. The user can immediately start creating spaces
