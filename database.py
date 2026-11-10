import sqlite3
conn = sqlite3.connect('bcrcpoints.db')
cursor = conn.cursor()

cursor.execute