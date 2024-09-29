document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const userTable = document.getElementById('userTable').querySelector('tbody');
    const clearBtn = document.getElementById('clearBtn');

    let users = [];

    userForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const dob = document.getElementById('dob').value;
        const email = document.getElementById('email').value;

        const user = {
            id: Date.now(),
            firstName,
            lastName,
            dob,
            email
        };

        users.push(user);
        renderUsers();
        userForm.reset();
    });

    clearBtn.addEventListener('click', function() {
        userForm.reset();
    });

    function renderUsers() {
        userTable.innerHTML = ''; 
        users.forEach(user => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.dob}</td>
                <td>${user.email}</td>
                <td>
                    <button onclick="editUser(${user.id})">Edit</button>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;

            userTable.appendChild(row);
        });
    }

    window.editUser = function(id) {
        const user = users.find(user => user.id === id);

        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('dob').value = user.dob;
        document.getElementById('email').value = user.email;

        users = users.filter(user => user.id !== id);
    };

    window.deleteUser = function(id) {
        users = users.filter(user => user.id !== id);
        renderUsers();
    };
});
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
mongoose.connect('mongodb://localhost:27017/crud_users', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));
const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    dob: String,
    email: String
});

const User = mongoose.model('User', UserSchema);

// CRUD Routes
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.post('/users', async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.json(user);
});

app.put('/users/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
});

app.delete('/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});
app.listen(3000, () => console.log('Server running on port 3000'));
document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const userTable = document.getElementById('userTable').querySelector('tbody');
    const clearBtn = document.getElementById('clearBtn');

    let editId = null;

    fetchUsers();

    userForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const dob = document.getElementById('dob').value;
        const email = document.getElementById('email').value;

        const user = { firstName, lastName, dob, email };

        if (editId) {
            await fetch(`http://localhost:3000/users/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            editId = null;
        } else {
            await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
        }

        fetchUsers();
        userForm.reset();
    });

    clearBtn.addEventListener('click', function() {
        userForm.reset();
        editId = null;
    });

    async function fetchUsers() {
        const res = await fetch('http://localhost:3000/users');
        const users = await res.json();
        renderUsers(users);
    }

    function renderUsers(users) {
        userTable.innerHTML = ''; 

        users.forEach(user => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.dob}</td>
                <td>${user.email}</td>
                <td>
                    <button onclick="editUser('${user._id}')">Edit</button>
                    <button onclick="deleteUser('${user._id}')">Delete</button>
                </td>
            `;

            userTable.appendChild(row);
        });
    }

    window.editUser = async function(id) {
        const res = await fetch(`http://localhost:3000/users/${id}`);
        const user = await res.json();

        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('dob').value = user.dob;
        document.getElementById('email').value = user.email;

        editId = id;
    };

    window.deleteUser = async function(id) {
        await fetch(`http://localhost:3000/users/${id}`, {
            method: 'DELETE'
        });
        fetchUsers();
    };
});
