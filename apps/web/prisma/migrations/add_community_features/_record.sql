-- Create migration record
INSERT INTO "_prisma_migrations" (
  "id",
  "checksum",
  "finished_at",
  "migration_name",
  "logs",
  "rolled_back_at",
  "started_at",
  "applied_steps_count"
) VALUES (
  'add_community_features',
  'manual_migration',
  NOW(),
  'add_community_features',
  NULL,
  NULL,
  NOW(),
  1
);
