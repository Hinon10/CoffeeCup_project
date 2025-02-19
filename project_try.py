import os
import random
import smtplib
import sqlite3
import time
from email.mime.text import MIMEText

import telebot
from dotenv import load_dotenv
from telebot import types

load_dotenv()
TOKEN = os.getenv('TOKEN')
EMAIL = os.getenv('EMAIL')
bot = telebot.TeleBot(TOKEN)
CHIEF_ID = 5712383956

user_states = {}


def database_exists():
    conn = sqlite3.connect('project.sql')
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS users (id int primary key, surname varchar(50), email varchar(50));")
    conn.commit()
    cur.close()
    conn.close()


def database_user_exists(user_id):
    conn = sqlite3.connect('project.sql')
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE id = '%d'" % user_id)
    user = cur.fetchone()
    cur.close()
    conn.close()
    if user:
        user_states[user_id] = {"step": "done"}
    return user is not None


def database_add_user(user_id, surname, email):
    conn = sqlite3.connect('project.sql')
    cur = conn.cursor()
    cur.execute("INSERT INTO users (id, surname, email) VALUES ('%d', '%s', '%s');" % (user_id, surname, email))
    conn.commit()
    cur.close()
    conn.close()


def send_verification_email(email, code):
    email_message = MIMEText(code)
    email_message['Subject'] = 'Email verification'
    email_message['From'] = EMAIL
    email_message['To'] = email
    with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
        smtp.starttls()
        smtp.login(EMAIL, os.getenv('PASSWORD'))
        smtp.send_message(email_message)


@bot.message_handler(commands=['start'])
def start_handler(message):
    user_id = message.chat.id
    user_states[user_id] = {"step": "ask_surname"}

    database_exists()

    user = database_user_exists(user_id)

    if user:
        markup = webapp_button()
        bot.send_message(user_id, "Welcome to CoffeeCup!\nYou are already registered and you can start ordering.",
                         reply_markup=markup)
    else:
        bot.send_message(user_id,
                         "Welcome to CoffeeCup!\nNow you will be registered!\nPlease, enter your surname (in English):")


@bot.message_handler(commands=['changename'])
def change_surname(message):
    user_id = message.chat.id
    database_user_exists(user_id)
    if user_states[user_id]["step"] == "done":
        bot.send_message(user_id, "You are registered.")
        return
    user_states[user_id] = {"step": "ask_surname"}
    bot.send_message(user_id, "Please, enter your surname (in English):")

@bot.message_handler(func=lambda message: message.chat.id in user_states)
def process_message(message):
    user_id = message.chat.id
    state = user_states.get(user_id, {})
    current_step = state.get("step")

    if current_step == "ask_surname":
        surname = message.text.strip()
        if not surname:
            bot.send_message(user_id, "Invalid surname. Please enter a valid surname:")
            return
        state["surname"] = surname.lower()
        state["step"] = "ask_email"
        bot.send_message(user_id,
                         "Thanks! Now please enter your Webster University email address (it must include '@webster.edu' and your surname):")

    elif current_step == "ask_email":
        email = message.text.strip()
        surname = state.get("surname", "")
        if "@webster.edu" not in email.lower() or surname not in email.lower():
            bot.send_message(user_id,
                             "Invalid email!\nYour email must be a Webster University email (include '@webster.edu') and contain your surname.\nPlease re-enter your email or change your surname using /changename:")
            return
        state["email"] = email
        generated_code = str(random.randint(10000, 99999))
        state["verif_code"] = generated_code
        state["timestamp"] = time.time()  # Store the time when the code is generated
        send_verification_email(email, generated_code)
        state["step"] = "ask_code"
        bot.send_message(user_id,
                         "A verification code has been sent to your email (if the code doesn't appear in your email, please, check the spelling of your email and if something wrong use /changename to start the process over).\nThe code is active only for 5 minutes\nPlease enter the code:")

    elif current_step == "ask_code":
        code_received = message.text.strip()
        stored_code = state.get("verif_code")
        timestamp = state.get("timestamp")
        if time.time() - timestamp > 300:  # Check if 5 minutes have passed
            bot.send_message(user_id, "The verification code has expired. Please restart the process using /start.")
            return
        if code_received != stored_code:
            bot.send_message(user_id, "Incorrect verification code. Please try again:")
            return

        email = state.get("email")
        surname = state.get("surname")
        database_add_user(user_id, surname, email)
        state["step"] = "done"
        markup = webapp_button()
        bot.send_message(user_id, "You are registered!\nPress the button to proceed with ordering.",
                         reply_markup=markup)


def webapp_button():
    markup = types.InlineKeyboardMarkup()
    markup.add(types.InlineKeyboardButton(text="Order", callback_data="ordering"))
    return markup


@bot.callback_query_handler(func=lambda call: True)
def confirmation(call):
    global CHIEF_ID
    print("ordering")


bot.polling(none_stop=True)
