-- Lets an HR_ADMIN/ORGANIZATION_ADMIN account be scoped to a single organization.
-- Nullable and unenforced until explicitly set: an admin with no organization_id keeps
-- today's platform-wide access (this deployment currently has zero organizations/admin
-- assignments), so this migration does not change behavior for any existing account.
ALTER TABLE accounts ADD COLUMN organization_id UUID REFERENCES organizations(id);

CREATE INDEX idx_accounts_organization_id ON accounts(organization_id);
