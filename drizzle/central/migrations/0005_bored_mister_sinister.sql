DROP INDEX "tenants_subdomain_unique";--> statement-breakpoint
DROP INDEX "tenants_database_name_unique";--> statement-breakpoint
ALTER TABLE `tenants` ALTER COLUMN "created_at" TO "created_at" integer DEFAULT (unixepoch());--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_subdomain_unique` ON `tenants` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_database_name_unique` ON `tenants` (`database_name`);--> statement-breakpoint
ALTER TABLE `tenants` ADD `updated_at` integer;--> statement-breakpoint
ALTER TABLE `tenants` ADD `deleted_at` integer;