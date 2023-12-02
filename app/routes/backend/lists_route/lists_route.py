from flask import request, jsonify
from app.database.lists.lists import create_list, get_all_user_lists, get_list_by_id, update_list, delete_list
from app.main import app

@app.route("/lists", methods=["POST"])
def lists():
  if request.method == "POST":
    data = request.get_json()
    result = create_list(data)
  return jsonify(result)

@app.route("/lists/all/<user_id>", methods=["GET"])
def get_all_lists(user_id):
  if request.method == "GET":
    result = get_all_user_lists(user_id) 
  return jsonify(result)

@app.route("/lists/<id>", methods=["GET", "PUT", "DELETE"])
def lists_by_id(id):
    if request.method == "PUT":
        data = request.get_json()
        result = update_list(id, data)
    elif request.method == "DELETE":
        result = get_list_by_id(id)
        if result is not None:
            result = delete_list(id)
        else:
            result = {"error": "List not found"}
    else:
        result = get_list_by_id(id)
    return jsonify(result)