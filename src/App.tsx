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
      <img src={logo} alt="logo" width="300px" height="300px" />
      <br />
      <img src="https://static.independent.co.uk/2021/12/07/10/PRI213893584.jpg?width=1200" alt="logo" width="400px" height="300px" />
    </div>
  );
}

export default App;
