import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState('')
  const addTodo = (e) => {
    e.preventDefault()
    if (!text.trim() || !dueDate) return

    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      dueDate: dueDate,
      done: false,
      alarmFired: false
    }

    setTodos([...todos, newTodo])
    setText('')
    setDueDate('')
  }
  const toggleDone = (id) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    )
  }
  useEffect(() => {
    // Ask permission to show browser notifications, once on load
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()

      setTodos((currentTodos) =>
        currentTodos.map((todo) => {
          if (!todo.done && !todo.alarmFired && new Date(todo.dueDate) <= now) {
            triggerAlarm(todo)
            return { ...todo, alarmFired: true }
          }
          return todo
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const triggerAlarm = (todo) => {
    // Sound
    const audio = new Audio(
      'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
    )
    audio.play()

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification('Task due!', { body: todo.text })
    } else {
      alert(`Task due: ${todo.text}`)
    }
  }

  return (
    <div>
      <h1>Todo Alarm</h1>

      <form onSubmit={addTodo}>
        <input
          type="text"
          placeholder="Task name"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => {
          const isOverdue = !todo.done && new Date(todo.dueDate) <= new Date()
          return (
            <li
              key={todo.id}
              className={
                todo.done ? 'done' : isOverdue ? 'overdue' : ''
              }
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleDone(todo.id)}
              />
              <span>{todo.text}</span>
              <span> — due: {new Date(todo.dueDate).toLocaleString()}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
export default App