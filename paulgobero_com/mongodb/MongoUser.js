/* crete a new user on the development database */

db = db.getSiblingDB('admin');
db.createUser(
    { 
        "user": process.env.DB_USER,
        "pwd": process.env.DB_PASSWORD,
        "roles": [
            { role: "readWrite", db: process.env.DB_NAME }
        ]
    }
)