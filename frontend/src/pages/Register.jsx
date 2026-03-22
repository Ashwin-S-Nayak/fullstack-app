import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      const res = await API.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password
      })
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>🚀</div>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Start managing your items today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { key:'name', label:'Full name', type:'text', placeholder:'John Doe' },
            { key:'email', label:'Email address', type:'email', placeholder:'you@example.com' },
            { key:'password', label:'Password', type:'password', placeholder:'Min 6 characters' },
            { key:'confirmPassword', label:'Confirm password', type:'password', placeholder:'Repeat password' }
          ].map(f => (
            <div key={f.key} style={styles.field}>
              <label style={styles.label}>{f.label}</label>
              <input
                style={styles.input}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
                required
              />
            </div>
          ))}
          <button style={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' },
  card: { background:'#161b22', border:'1px solid #30363d', borderRadius:'12px', padding:'40px', width:'100%', maxWidth:'400px' },
  logo: { fontSize:'32px', textAlign:'center', marginBottom:'16px' },
  title: { fontSize:'24px', fontWeight:'bold', textAlign:'center', marginBottom:'8px' },
  subtitle: { color:'#8b949e', textAlign:'center', marginBottom:'24px', fontSize:'14px' },
  error: { background:'rgba(248,81,73,0.1)', border:'1px solid rgba(248,81,73,0.4)', color:'#f85149', padding:'12px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px' },
  field: { marginBottom:'16px' },
  label: { display:'block', marginBottom:'6px', fontSize:'14px', color:'#c9d1d9' },
  input: { width:'100%', background:'#0d1117', border:'1px solid #30363d', color:'#e6edf3', padding:'10px 14px', borderRadius:'8px', fontSize:'14px', outline:'none' },
  button: { width:'100%', background:'#1f6feb', color:'#fff', border:'none', padding:'12px', borderRadius:'8px', fontSize:'15px', fontWeight:'bold', cursor:'pointer', marginTop:'8px' },
  footer: { textAlign:'center', marginTop:'24px', fontSize:'14px', color:'#8b949e' }
}
