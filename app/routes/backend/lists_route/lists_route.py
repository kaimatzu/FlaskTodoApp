from flask import request, jsonify
from app.database.lists.lists import create_list, get_all_user_lists, get_list_by_id, update_list, delete_list
from app.main import app

@app.route("/lists", methods=["GET", "POST"])
def lists():
  if request.method == "POST":
    data = request.get_json()
    result = create_list(data)
  else:
    result = get_all_user_lists(2) # make dynamic user id dynamic
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