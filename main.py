from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
import sqlite3
import json

app = FastAPI()


# Database initialization
def get_db_connection():
    conn = sqlite3.connect('project.sql')
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/", response_class=HTMLResponse)
async def serve_html():
    # Serve your `index_chiefs.html`
    with open("index_chiefs.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/products")
def get_products():
    """Fetch products from the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products")  # Ensure you have a 'products' table
    products = cursor.fetchall()
    conn.close()
    return {"products": [dict(product) for product in products]}  # Convert rows to a list of dictionaries
