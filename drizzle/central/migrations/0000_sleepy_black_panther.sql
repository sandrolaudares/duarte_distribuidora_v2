CREATE TABLE `tenants` (
	`tenant_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`subdomain` text NOT NULL,
	`database_name` text NOT NULL,
	`theme` text DEFAULT 'winter' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_subdomain_unique` ON `tenants` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_database_name_unique` ON `tenants` (`database_name`);