CREATE TABLE `persons` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255),
  `email` varchar(255)
);

CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(255),
  `password` varchar(255),
  `person_id` integer UNIQUE
);

CREATE TABLE `lists` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255),
  `user_id` integer 
);

CREATE TABLE `tasks` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `content` varchar(255),
  `list_id` integer,
  `parent_task_id` integer DEFAULT null,
  `level` integer DEFAULT 0 -- for limiting the depth of the subtasks
);

CREATE TABLE `notes` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `content` varchar(255),
  `task_id` integer
);

ALTER TABLE `users` ADD FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`) ON DELETE CASCADE;

ALTER TABLE `lists` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `tasks` ADD FOREIGN KEY (`list_id`) REFERENCES `lists` (`id`) ON DELETE CASCADE;

ALTER TABLE `tasks` ADD FOREIGN KEY (`parent_task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

ALTER TABLE `notes` ADD FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

