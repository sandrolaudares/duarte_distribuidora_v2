CREATE TABLE `cashierTransactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer,
	`deleted_at` integer,
	`cashier_id` integer,
	`order_id` integer,
	`created_by` text DEFAULT '',
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`metadata` text,
	FOREIGN KEY (`cashier_id`) REFERENCES `caixas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `pedidos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
