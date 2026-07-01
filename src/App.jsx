import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'
import Auth from './Auth'

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  // Check localStorage for existing session on page load
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  // Fetch todos whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchTodos()
    }
  }, [currentUser])

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos(data)
    }
  }

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date()

      setTodos((currentTodos) =>
        currentTodos.map((todo) => {
          if (!todo.done && !todo.alarm_fired && new Date(todo.due_date) <= now) {
            triggerAlarm(todo)
            supabase
              .from('todos')
              .update({ alarm_fired: true })
              .eq('id', todo.id)
              .then(({ error }) => {
                if (error) console.error('Error updating alarm_fired:', error)
              })
            return { ...todo, alarm_fired: true }
          }
          return todo
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const triggerAlarm = (todo) => {
    const audio = new Audio(
      'https://actions.google.com/sounds/v1/alarms/beep_short.ogg'
    )
    audio.play()

    if (Notification.permission === 'granted') {
      new Notification('Task due!', { body: todo.text })
    } else {
      alert(`Task due: ${todo.text}`)
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!text.trim() || !dueDate) return

    const newTodo = {
      text: text.trim(),
      due_date: new Date(dueDate).toISOString(),
      done: false,
      alarm_fired: false,
      user_id: currentUser.id
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([newTodo])
      .select()

    if (error) {
      console.error('Error adding todo:', error)
    } else {
      setTodos([...todos, data[0]])
      setText('')
      setDueDate('')
    }
  }

  const toggleDone = async (id) => {
    const todo = todos.find(t => t.id === id)
    const { error } = await supabase
      .from('todos')
      .update({ done: !todo.done })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
    } else {
      setTodos(todos.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      ))
    }
  }

  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      setTodos(todos.filter(t => t.id !== id))
    }
  }

  const handleLogin = (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    setCurrentUser(user)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setCurrentUser(null)
    setTodos([])
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Todo Alarm</h1>
        <div>
          <span>Hi, {currentUser.username}</span>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
        </div>
      </div>

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
          const isOverdue = !todo.done && new Date(todo.due_date) <= new Date()
          return (
            <li
              key={todo.id}
              className={todo.done ? 'done' : isOverdue ? 'overdue' : ''}
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleDone(todo.id)}
              />
              <span>{todo.text}</span>
              <span> — due: {new Date(todo.due_date).toLocaleString()}</span>
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default App