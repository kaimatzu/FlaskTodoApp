from flask import render_template, request, session, redirect, url_for
from app.routes.backend.users_route.users_route import get_user_by_username
from app.main import app

@app.route("/")
def login():
    title = "Login"
    content = render_template("login/login.html")
    return render_template('index.html', title=title, content=content, stylesheet="login.css")

@app.route("/login", methods=["POST"])
def auth():
    username = request.form.get("username")
    password = request.form.get("password")
    
    # Perform authentication logic, check username and password against database, etc.
    # Assuming you retrieve user_id during authentication
    user_id = authenticate(username, password)

    if user_id is not None:
        # Save user_id to Flask's session
        session['user_id'] = user_id
        return redirect(url_for('dashboard'))  # Redirect to the dashboard or any other route after successful login
    else:
        return render_template('login/login.html', message='Invalid credentials')  # Handle invalid credentials
    
def authenticate(username, password):
    user_info = get_user_by_username(username)
    
    if user_info is not None and user_info['password'] == password:
        # Authentication successful
        return user_info['id']
    else:
        # Authentication failed
        return None
