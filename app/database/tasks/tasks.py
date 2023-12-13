from app.database.db import fetchall, fetchone, execute

def create_task(data):
    cur = execute("""CALL create_task(%s, %s, %s)""",
            (data["content"], data["list_id"], data["parent_task_id"]))
    row = cur.fetchone()
    data["id"] = row["id"]
    return data

def get_all_list_tasks(list_id):
    rv = fetchall("""SELECT * FROM list_tasks_view WHERE list_id = %s""", (list_id,))
    return rv

def get_all_task_sub_tasks(list_id, parent_task_id):
    rv = fetchall("""SELECT * FROM list_tasks_view WHERE list_id = %s 
                  AND parent_task_id = %s""", (list_id, parent_task_id,))
    return rv

def get_task_by_id(id):
    rv = fetchone("""SELECT * FROM list_tasks_view WHERE task_id = %s""", (id,))
    return rv

def update_task(id, data):
    cur = execute("""CALL update_task(%s, %s)""",
          (id, data["content"]))
    row = cur.fetchone()
    data["id"] = row["id"]
    return data

def update_task_status(id, data):
    cur = execute("""CALL update_task_status(%s, %s)""",
          (id, data["finished"]))
    row = cur.fetchone()
    data["id"] = row["id"]
    return data

def delete_task(id):
    cur = execute("""CALL delete_task(%s)""", (id,))
    row = cur.fetchone()
    if row is None:
        return True
    return False