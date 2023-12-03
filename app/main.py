from datetime import timedelta
from flask import Flask
from app.database.db import set_database
from flask_mysqldb import MySQL
from dotenv import load_dotenv
import requests
from os import getenv
import secrets


app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
load_dotenv()

app.config["MYSQL_HOST"] = getenv("MYSQL_HOST")
#app.config["MYSQL_PORT"] = int(getenv("MYSQL_PORT"))
app.config["MYSQL_USER"] = getenv("MYSQL_USER")
app.config["MYSQL_PASSWORD"] = getenv("MYSQL_PASSWORD")
app.config["MYSQL_DB"] = getenv("MYSQL_DB")
# to return results as dictionaries and not an array
app.config["MYSQL_CURSORCLASS"] = getenv("MYSQL_CURSORCLASS")
app.config["MYSQL_AUTOCOMMIT"] = True if getenv("MYSQL_AUTOCOMMIT") == "True" else False

mysql = MySQL(app)
set_database(mysql)

from app.routes.frontend.login_route import login_route
app.route("/")(login_route.login)

from app.routes.frontend.register_route import register_route
app.route("/register")(register_route.register)
# app.route("/register")(register_route.auth_register)

from app.routes.frontend.dashboard_route import dashboard_route
app.route("/dashboard")(dashboard_route)

from app.routes.backend.users_route import users_route
app.route("/users")(users_route)

from app.routes.backend.lists_route import lists_route
app.route("/lists")(lists_route)

from app.routes.backend.tasks_route import tasks_route
app.route("/tasks")(tasks_route)

from app.routes.backend.notes_route import notes_route
app.route("/notes")(notes_route)