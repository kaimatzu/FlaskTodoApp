-- CRUD ops --
-- create list
DELIMITER $$$
CREATE PROCEDURE create_list(
    IN p_title VARCHAR(255),
    IN p_user_id INT
)
BEGIN
    DECLARE p_list_id INT;
    INSERT INTO lists (title, user_id) 
      VALUES (p_title, p_user_id);
    SET p_list_id = LAST_INSERT_ID();
    SELECT p_list_id AS id;
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
    UPDATE lists 
      SET title = p_title 
      WHERE id = p_list_id;
    SELECT p_list_id as id;
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

    SELECT id FROM lists
    WHERE id = p_list_id;
END $$$
DELIMITER ;