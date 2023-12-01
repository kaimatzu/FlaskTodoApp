-- Triggers --
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

-- -- trigger to delete notes when a task is deleted
-- DELIMITER $$$
-- CREATE TRIGGER delete_notes_on_task_delete
-- AFTER DELETE ON tasks
-- FOR EACH ROW
-- BEGIN
--     DELETE FROM notes WHERE task_id = OLD.id;
-- END $$$
-- DELIMITER ;

-- -- fetch all subtasks of a task a level deeper
-- CREATE VIEW subtasks_view AS
-- SELECT
--   subtask.id AS subtask_id,
--   subtask.content AS subtask_content,
--   parent_task.id AS parent_task_id,
--   parent_task.content AS parent_task_content
-- FROM
--   tasks subtask
-- INNER JOIN
--   tasks parent_task ON subtask.parent_task_id = parent_task.id;

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