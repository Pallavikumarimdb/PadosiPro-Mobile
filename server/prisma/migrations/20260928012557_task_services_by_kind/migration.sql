-- Replace the flat services list with per-help-kind service mapping
ALTER TABLE "Task" DROP COLUMN "services",
ADD COLUMN "servicesByKind" JSONB NOT NULL DEFAULT '{}';
