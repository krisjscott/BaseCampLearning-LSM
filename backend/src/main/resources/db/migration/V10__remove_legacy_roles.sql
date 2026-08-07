-- The role model now contains PUBLIC_USER, HR_ADMIN, ORGANIZATION_ADMIN, and
-- SUPER_ADMIN only. Convert accounts created by older versions before the
-- Java enum is read by the application.
UPDATE accounts
SET role = 'HR_ADMIN'
WHERE role = 'TRAINER';

UPDATE accounts
SET role = 'PUBLIC_USER'
WHERE role = 'EMPLOYEE';

-- The demo course used the legacy trainer account as its instructor. Keep the
-- course author relationship valid after that account is promoted above.
