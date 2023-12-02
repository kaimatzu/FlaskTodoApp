from flask import request, jsonify
from app.database.tasks.tasks import create_task, get_all_list_tasks, get_all_task_sub_tasks, get_task_by_id, update_task, delete_task
from app.main import app

@app.route("/tasks", methods=["POST"])
def tasks():
  if request.method == "POST":
    data = request.get_json()
    result = create_task(data)
  return jsonify(result)

@app.route("/tasks/all/<list_id>", methods=["GET"])
def get_all_tasks(list_id):
  if request.method == "GET":
    result = get_all_list_tasks(list_id) 
  return jsonify(result)

@app.route("/tasks/<id>", methods=["GET", "PUT", "DELETE"])
def tasks_by_id(id):
    if request.method == "PUT":
        data = request.get_json()
        result = update_task(id, data)
    elif request.method == "DELETE":
        result = get_task_by_id(id)
        if result is not None:
            result = delete_task(id)
        else:
            result = {"error": "Task not found"}
    else:
        result = get_task_by_id(id)
    return jsonify(result)

@app.route("/tasks/subtasks/<id>", methods=["GET"])
def get_task_sub_tasks(id):
    result = get_all_task_sub_tasks(5, id)
    return jsonify(result)