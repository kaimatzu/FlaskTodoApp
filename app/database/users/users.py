from app.database.db import fetchall, fetchone, execute
import MySQLdb as mdb

def create_user(data):
  cur = execute("""CALL create_user(%s, %s, %s, %s)""",
          (data["name"], data["email"], data["email"], data["password"]))
  row = cur.fetchone()
  data["id"] = row["id"]
  return data

def get_all_users():
  rv = fetchall("""SELECT * FROM user_view""")
  return rv

def get_user_by_id(id):
  rv = fetchone("""SELECT * FROM user_view WHERE id = %s""", (id,))
  return rv

def get_user_by_username(username):
  rv = fetchone("""SELECT * FROM user_view WHERE username = %s""", (username,))
  return rv

def update_user(id, data):
  cur = execute("""CALL update_user(%s, %s, %s, %s, %s)""",
          (id, data["name"], data["email"], data["email"], data["password"]))
  row = cur.fetchone()
  data["id"] = row["id"]
  return data

def delete_user(id):
  cur = execute("""CALL delete_user(%s)""", (id,))
  row = cur.fetchone()
  if row is None:
    return True
  return False