DROP INDEX IF EXISTS "user_username_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "user_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "paid_index";--> statement-breakpoint
DROP INDEX IF EXISTS "cliente_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "cliente_cellphone_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "cliente_phone_unique";--> statement-breakpoint
ALTER TABLE `cliente` ALTER COLUMN "max_credit" TO "max_credit" integer NOT NULL DEFAULT 0;--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `paid_index` ON `pedidos` (`amount_paid`) WHERE "pedidos"."amount_paid" >= "pedidos"."total";--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_email_unique` ON `cliente` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_cellphone_unique` ON `cliente` (`cellphone`);--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_phone_unique` ON `cliente` (`phone`);