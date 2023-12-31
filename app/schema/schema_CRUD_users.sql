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