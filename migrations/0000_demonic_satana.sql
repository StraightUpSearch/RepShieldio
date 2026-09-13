CREATE TABLE `audit_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`website` text,
	`message` text,
	`processed` integer DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `blog_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`meta_title` text,
	`meta_description` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_categories_slug_unique` ON `blog_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`keywords` text,
	`featured_image` text,
	`author` text NOT NULL,
	`status` text DEFAULT 'draft',
	`category` text,
	`tags` text,
	`reading_time` integer,
	`published_at` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `brand_scan_tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`brand_name` text NOT NULL,
	`processed` integer DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `quote_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reddit_url` text NOT NULL,
	`email` text NOT NULL,
	`processed` integer DEFAULT 0,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` text PRIMARY KEY NOT NULL,
	`sess` text NOT NULL,
	`expire` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` text DEFAULT 'standard' NOT NULL,
	`assigned_to` text,
	`title` text NOT NULL,
	`description` text,
	`reddit_url` text,
	`amount` text,
	`progress` integer DEFAULT 0,
	`request_data` text,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`ticket_id` integer,
	`type` text NOT NULL,
	`amount` text NOT NULL,
	`description` text,
	`stripe_payment_id` text,
	`status` text DEFAULT 'completed' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`profile_image_url` text,
	`password` text,
	`role` text DEFAULT 'user' NOT NULL,
	`account_balance` text DEFAULT '0.00',
	`credits_remaining` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);