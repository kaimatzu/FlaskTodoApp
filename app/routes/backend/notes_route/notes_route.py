from flask import request, jsonify
from app.database.notes.notes import *
from app.main import app

@app.route("/notes", methods=["GET", "POST"])
def notes():
  if request.method == "POST":
    data = request.get_json()
    result = create_note(data)
  else:
    result = get_all_task_notes(4) # make dynamic task id dynamic
  return jsonify(result)

@app.route("/notes/<id>", methods=["GET", "PUT", "DELETE"])
def notes_by_id(id):
    if request.method == "PUT":
        data = request.get_json()
        result = update_note(id, data)
    elif request.method == "DELETE":
        result = get_note_by_id(id)
        if result is not None:
            result = delete_note(id)
        else:
            result = {"error": "List not found"}
    else:
        result = get_note_by_id(id)
    return jsonify(result)