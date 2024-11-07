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
