CREATE TABLE `tipo_pagamento` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tipo_pagamento_nome_unique` ON `tipo_pagamento` (`nome`);--> statement-breakpoint
ALTER TABLE `contas` ADD `pagamento_id` integer REFERENCES tipo_pagamento(id);