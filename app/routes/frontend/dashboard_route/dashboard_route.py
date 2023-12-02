from flask import render_template, request, session, jsonify
from app.routes.backend.users_route.users_route import get_user_by_id
from app.routes.backend.lists_route.lists_route import get_all_user_lists
from app.main import app

@app.route("/dashboard")
def dashboard():
    data = get_user_by_id(session["user_id"])
    title = "Dashboard"
    name = data['name']
    user_lists =  get_all_user_lists(data['id'])
    content = render_template("dashboard/dashboard.html", 
                            name=name,
                            user_lists=user_lists)
    return render_template('index.html', 
                           title=title, 
                           content=content, 
                           stylesheet="dashboard.css")
    