from flask import render_template, request, session, redirect, url_for
from app.routes.backend.users_route.users_route import get_user_by_username
from app.database.users.users import create_user
from app.main import app

@app.route("/register/")
def register():
    title = "Register"
    content = render_template("register/register.html")
    return render_template('index.html', title=title, content=content, stylesheet="login.css")

@app.route("/register/", methods=["POST"])
def auth_register():
    name = request.form.get("name")
    username = request.form.get("username")
    password = request.form.get("password")
    
    
    can_register = authenticate(username)

    user_data = {
        "name": name,
        "email": username,
        "password": password
    }
    
    if can_register:
        result = create_user(user_data)
        session['user_id'] = result['id']
        return redirect(url_for('dashboard')) 
    else:
        title = "Register"
        content = render_template("register/register.html", message='User already exists')
        return render_template('index.html', title=title, content=content, stylesheet="login.css")
       
    
def authenticate(username):
    user_info = get_user_by_username(username)
    
    if user_info is not None:
        # User exists
        return False
    else:
        # No user
        return True