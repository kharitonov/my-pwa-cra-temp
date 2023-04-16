import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [user, setUser] = useState('')
  const [user1, setUser1] = useState('')
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(json => setUser(json.title))
    fetch('https://jsonplaceholder.typicode.com/todos/2')
      .then(response => response.json())
      .then(json => setUser1(json.title))
  }, [])
  return (
    <div className="App">
      <h1>Hello World</h1>
      <h2>{user}</h2>
      <h2>{user1}</h2>
    </div>
  );
}

export default App;
