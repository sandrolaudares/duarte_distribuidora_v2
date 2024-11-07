CREATE TABLE `stock_transference` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer,
	`deleted_at` integer,
	`status` text DEFAULT 'new' NOT NULL,
	`from_tenant_id` integer,
	`to_tenant_id` integer NOT NULL,
	`sku_name` text NOT NULL,
	`sku` text NOT NULL,
	`quantity` integer NOT NULL,
	`meta_data` text NOT NULL,
	FOREIGN KEY (`from_tenant_id`) REFERENCES `tenants`(`tenant_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_tenant_id`) REFERENCES `tenants`(`tenant_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`tenant_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`subdomain` text NOT NULL,
	`database_name` text NOT NULL,
	`theme` text DEFAULT 'winter' NOT NULL,
	`address` text,
	`phone` text,
	`lat` real,
	`lng` real,
	`taxa_por_km` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_subdomain_unique` ON `tenants` (`subdomain`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_database_name_unique` ON `tenants` (`database_name`);