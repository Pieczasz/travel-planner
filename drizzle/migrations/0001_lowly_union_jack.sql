ALTER TABLE `trips` ADD `country` text NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `state` text NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `city` text NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` DROP COLUMN `destination`;