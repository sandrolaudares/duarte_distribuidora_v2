DROP INDEX "user_username_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "paid_index";--> statement-breakpoint
DROP INDEX "cliente_email_unique";--> statement-breakpoint
DROP INDEX "cliente_cellphone_unique";--> statement-breakpoint
DROP INDEX "cliente_phone_unique";--> statement-breakpoint
DROP INDEX "tipo_pagamento_nome_unique";--> statement-breakpoint
ALTER TABLE `product_item` ALTER COLUMN "tipo" TO "tipo" text(2) DEFAULT 'bebida';--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `paid_index` ON `pedidos` (`amount_paid`) WHERE "pedidos"."amount_paid" >= "pedidos"."total";--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_email_unique` ON `cliente` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_cellphone_unique` ON `cliente` (`cellphone`);--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_phone_unique` ON `cliente` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `tipo_pagamento_nome_unique` ON `tipo_pagamento` (`nome`);