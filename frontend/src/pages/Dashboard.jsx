import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', description: '', status: 'active' })
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [dbStatus, setDbStatus] = useState('checking')

  useEffect(() => {
    loadItems()
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      const res = await API.get('/api/health')
      setDbStatus(res.data.database === 'connected' ? 'connected' : 'disconnected')
    } catch {
      setDbStatus('disconnected')
    }
  }

  const loadItems = async () => {
    try {
      const res = await API.get('/api/items')
      setItems(res.data.items || [])
    } catch (err) {
      showToast('Failed to load items', 'error')
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return showToast('Name is required', 'error')
    setAdding(true)
    try {
      await API.post('/api/items', form)
      setForm({ name: '', description: '', status: 'active' })
      showToast('Item added!', 'success')
      loadItems()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add item', 'error')
    } finally {
      setAdding(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/api/items/${id}`, { status })
      showToast('Status updated!', 'success')
      loadItems()
    } catch {
      showToast('Failed to update', 'error')
    }
  }

  const deleteItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await API.delete(`/api/items/${id}`)
      showToast('Item deleted!', 'success')
      loadItems()
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast(t => ({...t, show: false})), 3000)
  }

  const statusColor = { active: '#3fb950', pending: '#d29922', done: '#58a6ff' }

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.navBrand}>⚡ FullStack App</div>
        <div style={styles.navRight}>
          <div style={styles.statusDots}>
            <span style={{...styles.dot, background: dbStatus==='connected' ? '#3fb950' : '#f85149'}}></span>
            <span style={{fontSize:'13px', color:'#8b949e'}}>MongoDB</span>
          </div>
          <span style={styles.userName}>👤 {user?.name}</span>
          <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </nav>

      <div style={styles.container}>
        {/* ADD ITEM FORM */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add New Item</h2>
          <form onSubmit={addItem} style={styles.form}>
            <input
              style={styles.input}
              type="text"
              placeholder="Item name (required)"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <select
              style={styles.select}
              value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
            <button style={styles.addBtn} disabled={adding}>
              {adding ? 'Adding...' : '+ Add Item'}
            </button>
          </form>
        </div>

        {/* ITEMS LIST */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            All Items
            <span style={styles.badge}>{items.length}</span>
          </h2>

          {loading ? (
            <div style={styles.empty}>Loading from MongoDB...</div>
          ) : items.length === 0 ? (
            <div style={styles.empty}>
              <div style={{fontSize:'48px', marginBottom:'12px'}}>📭</div>
              <p>No items yet. Add your first item above!</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} style={styles.itemCard}>
                <div style={styles.itemInfo}>
                  <div style={styles.itemName}>{item.name}</div>
                  {item.description && (
                    <div style={styles.itemDesc}>{item.description}</div>
                  )}
                  <div style={styles.itemMeta}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <select
                  style={{
                    ...styles.statusSelect,
                    color: statusColor[item.status],
                    borderColor: statusColor[item.status]
                  }}
                  value={item.status}
                  onChange={e => updateStatus(item._id, e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                </select>
                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteItem(item._id, item.name)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{
          ...styles.toast,
          background: toast.type === 'success' ? '#238636' : '#da3633'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight:'100vh' },
  nav: { background:'#161b22', borderBottom:'1px solid #30363d', padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  navBrand: { fontWeight:'bold', fontSize:'18px', color:'#58a6ff' },
  navRight: { display:'flex', alignItems:'center', gap:'16px' },
  statusDots: { display:'flex', alignItems:'center', gap:'6px' },
  dot: { width:'8px', height:'8px', borderRadius:'50%', display:'inline-block' },
  userName: { fontSize:'14px', color:'#c9d1d9' },
  logoutBtn: { background:'transparent', color:'#f85149', border:'1px solid #f85149', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  container: { maxWidth:'800px', margin:'32px auto', padding:'0 16px' },
  card: { background:'#161b22', border:'1px solid #30363d', borderRadius:'12px', padding:'24px', marginBottom:'24px' },
  cardTitle: { fontSize:'16px', marginBottom:'20px', paddingBottom:'12px', borderBottom:'1px solid #30363d', display:'flex', alignItems:'center', gap:'8px' },
  badge: { background:'#30363d', color:'#8b949e', padding:'2px 8px', borderRadius:'20px', fontSize:'12px' },
  form: { display:'flex', gap:'10px', flexWrap:'wrap' },
  input: { flex:'1', minWidth:'180px', background:'#0d1117', border:'1px solid #30363d', color:'#e6edf3', padding:'10px 14px', borderRadius:'8px', fontSize:'14px', outline:'none' },
  select: { background:'#0d1117', border:'1px solid #30363d', color:'#e6edf3', padding:'10px 14px', borderRadius:'8px', fontSize:'14px', outline:'none' },
  addBtn: { background:'#238636', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'8px', fontSize:'14px', fontWeight:'bold', cursor:'pointer' },
  empty: { textAlign:'center', padding:'48px 24px', color:'#6e7681', fontSize:'14px' },
  itemCard: { display:'flex', alignItems:'center', gap:'12px', padding:'14px', background:'#0d1117', borderRadius:'8px', marginBottom:'10px', border:'1px solid #21262d' },
  itemInfo: { flex:'1' },
  itemName: { fontWeight:'bold', fontSize:'15px', marginBottom:'4px' },
  itemDesc: { fontSize:'13px', color:'#8b949e', marginBottom:'4px' },
  itemMeta: { fontSize:'12px', color:'#6e7681' },
  statusSelect: { background:'transparent', border:'1px solid', borderRadius:'6px', padding:'4px 8px', fontSize:'12px', fontWeight:'bold', cursor:'pointer', outline:'none' },
  deleteBtn: { background:'#da3633', color:'#fff', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'13px' },
  toast: { position:'fixed', bottom:'24px', right:'24px', color:'#fff', padding:'12px 20px', borderRadius:'8px', fontWeight:'bold', fontSize:'14px', zIndex:999 }
}
