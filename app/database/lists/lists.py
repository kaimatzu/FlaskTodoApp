from app.database.db import fetchall, fetchone, execute

def create_list(data):
    cur = execute("""CALL create_list(%s, %s)""",
            (data["title"], data["user_id"]))
    row = cur.fetchone()
    data["id"] = row["id"]
    return data

def get_all_user_lists(user_id):
    rv = fetchall("""SELECT * FROM user_lists_view WHERE user_id = %s""", (user_id,))
    return rv

def get_list_by_id(id):
    rv = fetchone("""SELECT * FROM user_lists_view WHERE list_id = %s""", (id,))
    return rv

def update_list(id, data):
    cur = execute("""CALL update_list(%s, %s)""",
          (id, data["title"]))
    row = cur.fetchone()
    data["id"] = row["id"]
    return data

def delete_list(id):
    cur = execute("""CALL delete_list(%s)""", (id,))
    row = cur.fetchone()
    if row is None:
        return True
    return False