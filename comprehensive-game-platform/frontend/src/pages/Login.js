import React, { useState } from 'react';
import { loginUser } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginUser(form);
      localStorage.setItem('token', data.token);
      setMessage('✅ Login successful!');
    } catch (err) {
      setMessage('❌ ' + err.response.data.error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })}/>
        <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })}/>
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  );
}
