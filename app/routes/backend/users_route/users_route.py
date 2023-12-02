from flask import request, jsonify
from app.database.users.users import get_all_users, get_user_by_id, get_user_by_username, create_user, update_user, delete_user
from app.main import app

@app.route("/users", methods=["GET", "POST"])
def users():
  if request.method == "POST":
    data = request.get_json()
    result = create_user(data)
  else:
    result = get_all_users()
  return jsonify(result)


@app.route("/users/<id>", methods=["GET", "PUT", "DELETE"])
def users_by_id(id):
  if request.method == "PUT":
    data = request.get_json()
    result = update_user(id, data)
  elif request.method == "DELETE":
    result = get_user_by_id(id)
    if result is not None:
      result = delete_user(id)
    else:
      result = {"error": "User not found"}
  else:
    result = get_user_by_id(id)
  return jsonify(result)

@app.route("/users/get/<username>", methods=["GET"])
def users_by_username(username):
  result = get_user_by_username(username)
  return jsonify(result)