from flask import render_template
from app.main import app

@app.route("/")
def login():
    title = "Login"
    content = render_template("login/login.html")
    return render_template('index.html', title=title, content=content, stylesheet="login.css")
