from app.database.db import fetchall, fetchone, execute

def create_note(data):
    cur = execute("""CALL create_note(%s, %s)""",
            (data["content"], data["task_id"]))
    row = cur.fetchone()
    data["id"] = row["id"]
    return data

def get_all_task_notes(task_id):
    rv = fetchall("""SELECT * FROM task_notes_view WHERE task_id = %s""", (task_id,))
    return rv

def get_note_by_id(id):
    rv = fetchone("""SELECT * FROM task_notes_view WHERE note_id = %s""", (id,))
    return rv

def update_note(id, data):
    cur = execute("""CALL update_note(%s, %s)""",
          (id, data["content"]))
    row = cur.fetchone()
    data["id"] = row["id"]
    return data

def delete_note(id):
    cur = execute("""CALL delete_note(%s)""", (id,))
    row = cur.fetchone()
    if row is None:
        return True
    return False