# Ties HQ Crew ID Standard

## Purpose

Crew ID is the short, permanent identity used across Ties HQ and Base Camp. It identifies a person or approved external participant without embedding changeable details such as department, seniority, or job title.

## Format

`CRW-{SERIES}-{NUMBER}`

Examples:

- `CRW-A-0001`
- `CRW-A-0427`
- `CRW-Z-9999`
- `CRW-AA-0001`

## Allocation

- Each series contains numbers `0001` through `9999`.
- When a series is exhausted, advance alphabetically: `A` through `Z`, then `AA`, `AB`, and so on.
- Numbers are never reused, even after departure or account closure.
- Assignment is sequential within a series.
- A Crew ID is immutable after issue.

## Audience classification

Employee, intern, contractor, client, partner, and other classes belong in a separate `person_type` field. Department, role, permissions, employment status, manager, and location are also separate attributes.

This keeps the identifier stable when a person changes teams or converts from intern to employee.

## Record fields

- Crew ID
- Legal and preferred name
- Primary email
- Person type
- Organization or client account
- Department and role
- Manager or sponsor
- Start and optional end date
- Account status
- Authentication methods
- Created, updated, and deactivated timestamps

## Lifecycle

1. Authorized administrator creates the person record.
2. The server allocates the next available ID in a transaction.
3. The person receives or activates access.
4. Role and audience changes update attributes, not the Crew ID.
5. On departure, the account is deactivated and the ID is retained for audit.
6. Returning people recover the same identity unless governance explicitly requires a new legal record.

## Security

Crew ID is a username, not a secret. Authentication still requires a password, one-time code, SSO, passkey, or another approved factor. Rate limiting, account lockout, session management, and audit logging apply to Crew ID sign-in.

