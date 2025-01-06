PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_product_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer,
	`deleted_at` integer,
	`product_id` integer NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`image_id` integer,
	`retail_price` integer NOT NULL,
	`wholesale_price` integer NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sku`) REFERENCES `estoque`(`sku`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_product_item`("id", "created_at", "updated_at", "deleted_at", "product_id", "name", "sku", "quantity", "image_id", "retail_price", "wholesale_price", "visible") SELECT "id", "created_at", "updated_at", "deleted_at", "product_id", "name", "sku", "quantity", "image_id", "retail_price", "wholesale_price", "visible" FROM `product_item`;--> statement-breakpoint
DROP TABLE `product_item`;--> statement-breakpoint
ALTER TABLE `__new_product_item` RENAME TO `product_item`;--> statement-breakpoint
PRAGMA foreign_keys=ON;