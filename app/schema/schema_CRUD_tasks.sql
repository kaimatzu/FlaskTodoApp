-- CRUD ops --
-- create task
DELIMITER $$$
CREATE PROCEDURE create_task(
    IN p_content VARCHAR(255),
    IN p_list_id INT,
    IN p_parent_task_id INT
)
BEGIN
    DECLARE p_task_id INT;
    INSERT INTO tasks (content, list_id, parent_task_id) 
    VALUES (p_content, p_list_id, p_parent_task_id);
    SET p_task_id = LAST_INSERT_ID();
    SELECT p_task_id AS id;
END $$$
DELIMITER ;

-- read tasks of list
CREATE VIEW list_tasks_view AS
SELECT
  tasks.id AS task_id,
  tasks.content AS task_content,
  tasks.parent_task_id as parent_task_id,
  tasks.finished as finished,
  tasks.level as task_depth_level,
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
    UPDATE tasks 
      SET content = p_content 
      WHERE id = p_task_id;
    SELECT p_task_id as id;
END $$$
DELIMITER ;

-- update task status
DELIMITER $$$
CREATE PROCEDURE update_task_status(
    IN p_task_id INT,
    IN p_finished BOOLEAN
)
BEGIN
    UPDATE tasks 
      SET finished = p_finished 
      WHERE id = p_task_id;
    SELECT p_task_id as id;
END $$$
DELIMITER ;

-- delete task
DELIMITER $$$
CREATE PROCEDURE delete_task(
    IN p_task_id INT
)
BEGIN
    DELETE FROM tasks WHERE id = p_task_id;

    SELECT id FROM tasks
    WHERE id = p_task_id;
END $$$
DELIMITER ;