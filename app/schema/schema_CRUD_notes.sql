-- CRUD ops --
-- create note
DELIMITER $$$
CREATE PROCEDURE create_note(
    IN p_content VARCHAR(255),
    IN p_task_id INT
)
BEGIN
    DECLARE p_note_id INT;
    INSERT INTO notes (content, task_id) 
    VALUES (p_content, p_task_id);
    SET p_note_id = LAST_INSERT_ID();
    SELECT p_note_id AS id;
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
    UPDATE notes 
      SET content = p_content 
      WHERE id = p_note_id;
    SELECT p_note_id as id;
END $$$
DELIMITER ;

-- delete note
DELIMITER $$$
CREATE PROCEDURE delete_note(
    IN p_note_id INT
)
BEGIN
    DELETE FROM notes WHERE id = p_note_id;

    SELECT id FROM notes
    WHERE id = p_note_id;
END $$$
DELIMITER ;