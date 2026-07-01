import { useState } from 'react'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

function Auth({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password')
      return
    }

    if (isRegistering) {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username.trim())
        .single()

      if (existingUser) {
        setError('Username already taken')
        return
      }

      // Hash password and create user
      const salt = bcrypt.genSaltSync(10)
      const password_hash = bcrypt.hashSync(password, salt)

      const { data, error } = await supabase
        .from('users')
        .insert([{ username: username.trim(), password_hash }])
        .select()

      if (error) {
        setError('Error creating account')
        console.error(error)
      } else {
        onLogin(data[0])
      }
    } else {
      // Find user by username
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .single()

      if (error || !user) {
        setError('Username not found')
        return
      }

      // Compare password
      const match = bcrypt.compareSync(password, user.password_hash)
      if (!match) {
        setError('Incorrect password')
        return
      }

      onLogin(user)
    }
  }

  return (
    <div>
      <h1>Todo Alarm</h1>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p>
        {isRegistering ? 'Already have an account?' : "Don't have an account?"}
        <button onClick={() => { setIsRegistering(!isRegistering); setError('') }}>
          {isRegistering ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  )
}

export default Auth