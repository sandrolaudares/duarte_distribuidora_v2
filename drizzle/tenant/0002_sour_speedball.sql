CREATE TABLE `contas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer,
	`deleted_at` integer,
	`fornecedor_id` integer,
	`descricao` text,
	`expire_at` integer,
	`valor_conta` integer NOT NULL,
	FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedor`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `product_item` ADD `visible` integer DEFAULT true NOT NULL;