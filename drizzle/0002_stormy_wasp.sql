CREATE TABLE `host_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`run_id` text NOT NULL,
	`state` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`remote_id` text DEFAULT '' NOT NULL,
	`error` text DEFAULT '' NOT NULL,
	`article_ids` text DEFAULT '[]' NOT NULL,
	`updated_at` text NOT NULL
);
