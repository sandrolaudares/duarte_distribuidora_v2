CREATE TABLE `magic_link` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `password_reset_code` (
	`token_hash` text NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`username` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`password_hash` text NOT NULL,
	`permissions` text DEFAULT '{"role":"user"}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_verification_code` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `image` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`uploaded_by` text,
	`name` text NOT NULL,
	`data` blob NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `product_category` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`sku` integer,
	`quantity` integer DEFAULT 1 NOT NULL,
	`image_id` integer,
	`retail_price` integer NOT NULL,
	`wholesale_price` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sku`) REFERENCES `sku`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`category_id` integer,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image_id` integer,
	FOREIGN KEY (`category_id`) REFERENCES `product_category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bugReport` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`created_by` text DEFAULT '',
	`status` text NOT NULL,
	`name` text NOT NULL,
	`metadata` text,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`created_by` text DEFAULT '',
	`text` text NOT NULL,
	`metadata` text,
	`error` text,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `stock` (
	`distribuidora_id` integer NOT NULL,
	`sku` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`quantity` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`distribuidora_id`, `sku`),
	FOREIGN KEY (`distribuidora_id`) REFERENCES `distribuidora`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sku`) REFERENCES `sku`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sku` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `stock_transaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`distribuidora_id` integer NOT NULL,
	`sku` integer NOT NULL,
	`quantity` integer NOT NULL,
	`type` text NOT NULL,
	`supplier_id` integer,
	`cost_price` integer,
	`meta_data` text NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`distribuidora_id`,`sku`) REFERENCES `stock`(`distribuidora_id`,`sku`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tranferance_tem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sku` integer NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`sku`) REFERENCES `sku`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stock_transferance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`created_by` text NOT NULL,
	`from_distribuidora_id` integer NOT NULL,
	`status` text DEFAULT 'PENDING',
	FOREIGN KEY (`created_by`) REFERENCES `user`(`username`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`from_distribuidora_id`) REFERENCES `distribuidora`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `supplier` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `notification_channel` (
	`channel_id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `notification_channel_users` (
	`channel_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `push_notification_device` (
	`device_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`subscription` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `push_notification_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` integer,
	`channel_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`payload` text NOT NULL,
	`http_status` integer NOT NULL,
	`success` integer NOT NULL,
	`err_message` text,
	FOREIGN KEY (`device_id`) REFERENCES `push_notification_device`(`device_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`channel_id`) REFERENCES `notification_channel`(`channel_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `address` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`customer_id` integer NOT NULL,
	`cep` text NOT NULL,
	`street` text NOT NULL,
	`number` text NOT NULL,
	`complement` text NOT NULL,
	`neighborhood` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`country` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customer_order` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`distribuidora_id` integer,
	`customer_id` integer,
	`address_id` integer,
	`payment_method` text NOT NULL,
	`payment_status` text DEFAULT 'PENDING' NOT NULL,
	`observation` text,
	`total` integer NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`distribuidora_id`) REFERENCES `distribuidora`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`address_id`) REFERENCES `address`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`is_retail` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`name` text NOT NULL,
	`email` text,
	`birth_date` text,
	`cellphone` text,
	`phone` text,
	`cpf_cnpj` text,
	`rg_ie` text,
	`max_credit` integer DEFAULT 50000 NOT NULL,
	`used_credit` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `customer_order`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `product_item`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cashier` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`distribuidora_id` integer NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'Fechado' NOT NULL,
	`currency` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`distribuidora_id`) REFERENCES `distribuidora`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cashier_transaction` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer,
	`cashier_id` integer NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL,
	`type` text NOT NULL,
	`meta_data` text NOT NULL,
	FOREIGN KEY (`cashier_id`) REFERENCES `cashier`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `distribuidora` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_channel_channel_id_unique` ON `notification_channel` (`channel_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `push_notification_device_subscription_unique` ON `push_notification_device` (`subscription`);--> statement-breakpoint
CREATE UNIQUE INDEX `customer_email_unique` ON `customer` (`email`);