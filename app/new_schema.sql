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
  `user_id` integer UNIQUE
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

ALTER TABLE `users` ADD FOREIGN KEY (`person_id`) REFERENCES `persons` (`id`);

ALTER TABLE `lists` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `tasks` ADD FOREIGN KEY (`list_id`) REFERENCES `lists` (`id`);

-- cascade delete subtask
ALTER TABLE `tasks` ADD FOREIGN KEY (`parent_task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE;

ALTER TABLE `notes` ADD FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`);

-- CRUD ops --
-- create user
DELIMITER $$$
CREATE PROCEDURE create_user(
    IN p_name varchar(500),
    IN p_email varchar(200),
    IN p_username varchar(100),
    IN p_password varchar(200)
)
BEGIN
    DECLARE p_person_id INT;
    DECLARE p_user_id INT;
    INSERT INTO persons (name, email)
        VALUES (p_name, p_email);
    SET p_person_id = LAST_INSERT_ID();
    INSERT INTO users (person_id, username, password)
        VALUES (p_person_id, p_username, p_password);
    SET p_user_id = LAST_INSERT_ID();
    SELECT p_user_id AS id;
END $$$
DELIMITER ;

-- read all users
CREATE VIEW user_view AS
    SELECT
        users.id,
        users.username,
        users.password,
        persons.name,
        persons.email
    FROM
        users
    INNER JOIN
        persons ON users.person_id = persons.id;

-- update user
DELIMITER $$$
CREATE PROCEDURE update_user(
  IN p_id INT,
  IN p_name varchar(500),
  IN p_email varchar(200),
  IN p_username varchar(100),
  IN p_password varchar(200)
)
BEGIN
  UPDATE persons
    INNER JOIN users ON persons.id = users.person_id
    SET name = p_name,
      email = p_email
    WHERE users.id = p_id;
  UPDATE users
    SET username = p_username,
      password = p_password
    WHERE id = p_id;
  SELECT p_id AS id;
END $$$
DELIMITER ;

-- delete user
DELIMITER $$$
CREATE PROCEDURE delete_user(
  IN p_id INT
)
BEGIN
  DELETE persons.* FROM persons
  INNER JOIN users ON persons.id = users.person_id
  WHERE users.id = p_id;
  DELETE FROM users
  WHERE id = p_id;
  SELECT id FROM users
  WHERE id = p_id;
END $$$
DELIMITER ;



-- create list
DELIMITER $$$
CREATE PROCEDURE create_list(
    IN p_title VARCHAR(255),
    IN p_user_id INT
)
BEGIN
    INSERT INTO lists (title, user_id) VALUES (p_title, p_user_id);
END $$$
DELIMITER ;

-- read lists of user
CREATE VIEW user_lists_view AS
SELECT
  lists.id AS list_id,
  lists.title AS list_title,
  users.id AS user_id,
  users.username AS username
FROM
  lists
INNER JOIN
  users ON lists.user_id = users.id;

-- update list 
DELIMITER $$$
CREATE PROCEDURE update_list(
    IN p_list_id INT,
    IN p_title VARCHAR(255)
)
BEGIN
    UPDATE lists SET title = p_title WHERE id = p_list_id;
END $$$
DELIMITER ;

-- delete list
DELIMITER $$$
CREATE PROCEDURE delete_list(
    IN p_list_id INT
)
BEGIN
    -- delete associated tasks (there is a trigger that will cascade delete the subtasks)
    DELETE FROM tasks WHERE list_id = p_list_id;

    -- delete the list
    DELETE FROM lists WHERE id = p_list_id;
END $$$
DELIMITER ;

-- create task
DELIMITER $$$
CREATE PROCEDURE create_task(
    IN p_content VARCHAR(255),
    IN p_list_id INT,
    IN p_parent_task_id INT
)
BEGIN
    INSERT INTO tasks (content, list_id, parent_task_id) VALUES (p_content, p_list_id, p_parent_task_id);
END $$$
DELIMITER ;

-- read tasks of list
CREATE VIEW list_tasks_view AS
SELECT
  tasks.id AS task_id,
  tasks.content AS task_content,
  lists.id AS list_id,
  lists.title AS list_title
FROM
  tasks
INNER JOIN
  lists ON tasks.list_id = lists.id;

-- update task
DELIMITER $$$
CREATE PROCEDURE update_task(
    IN p_task_id INT,
    IN p_content VARCHAR(255)
)
BEGIN
    UPDATE tasks SET content = p_content WHERE id = p_task_id;
END $$$
DELIMITER ;

-- delete task
DELIMITER $$$
CREATE PROCEDURE delete_task(
    IN p_task_id INT
)
BEGIN
    DELETE FROM tasks WHERE id = p_task_id;
END $$$
DELIMITER ;

-- create note
DELIMITER $$$
CREATE PROCEDURE create_note(
    IN p_content VARCHAR(255),
    IN p_task_id INT
)
BEGIN
    INSERT INTO notes (content, task_id) VALUES (p_content, p_task_id);
END $$$
DELIMITER ;

-- read notes of a task
CREATE VIEW task_notes_view AS
SELECT
  notes.id AS note_id,
  notes.content AS note_content,
  tasks.id AS task_id,
  tasks.content AS task_content
FROM
  notes
INNER JOIN
  tasks ON notes.task_id = tasks.id;

-- update note
DELIMITER $$$
CREATE PROCEDURE update_note(
    IN p_note_id INT,
    IN p_content VARCHAR(255)
)
BEGIN
    UPDATE notes SET content = p_content WHERE id = p_note_id;
END $$$
DELIMITER ;

-- delete note
DELIMITER $$$
CREATE PROCEDURE delete_note(
    IN p_note_id INT
)
BEGIN
    DELETE FROM notes WHERE id = p_note_id;
END $$$
DELIMITER ;

-- fetch all subtasks of a task a level deeper
CREATE VIEW subtasks_view AS
SELECT
  subtask.id AS subtask_id,
  subtask.content AS subtask_content,
  parent_task.id AS parent_task_id,
  parent_task.content AS parent_task_content
FROM
  tasks subtask
INNER JOIN
  tasks parent_task ON subtask.parent_task_id = parent_task.id;

-- prevent adding self as subtask to avoid undefined behavior in app
DELIMITER $$$
CREATE TRIGGER prevent_self_reference
BEFORE INSERT ON tasks
FOR EACH ROW
BEGIN
    IF NEW.parent_task_id IS NOT NULL AND NEW.parent_task_id = NEW.id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Adding self as a subtask is not allowed';
    END IF;
END; $$$
DELIMITER ;

-- trigger to set the depth of a task when adding as a subtask
DELIMITER $$$
CREATE TRIGGER set_subtask_depth
BEFORE INSERT ON tasks
FOR EACH ROW
BEGIN
    DECLARE parent_depth INT;
    
    -- get the depth levelof the parent task
    SELECT level INTO parent_depth
    FROM tasks
    WHERE id = NEW.parent_task_id;
    
    -- set the depth level of the new task
    SET NEW.level = IFNULL(parent_depth, -1) + 1;
    
    -- check depth level
    IF NEW.level > 2 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Subtask depth limit exceeded.';
    END IF;
END; $$$
DELIMITER ;

    -- trigger to delete notes when a task is deleted
    DELIMITER $$$
    CREATE TRIGGER delete_notes_on_task_delete
    AFTER DELETE ON tasks
    FOR EACH ROW
    BEGIN
        DELETE FROM notes WHERE task_id = OLD.id;
    END $$$
    DELIMITER ;


-- -- trigger to delete subtasks when a parent task is deleted
-- DELIMITER $$$
-- CREATE TRIGGER cascade_delete_subtasks
-- BEFORE DELETE ON tasks
-- FOR EACH ROW
-- BEGIN
--     -- delete subtasks recursively
--     DELETE FROM tasks WHERE parent_task_id = OLD.id;
-- END $$$
-- DELIMITER ;

