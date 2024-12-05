CREATE TABLE `categoria` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `contas` ADD `categoria_id` integer REFERENCES categoria(id);