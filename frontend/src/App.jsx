import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api/products'
const EMPTY_FORM = { name: '', brand: '', price: '', quantity: '1' }

async function requestProducts(url, options) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `Request failed (${response.status})`)
  }

  return response.json()
}

function App() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadProducts() {
    setLoading(true)
    setError('')
    try {
      setProducts(await requestProducts(API_URL))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isActive = true
    requestProducts(API_URL)
      .then((data) => {
        if (isActive) setProducts(data)
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message)
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function startEditing(product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      brand: product.brand || '',
      price: String(product.price),
      quantity: String(product.quantity ?? 0),
    })
    setError('')
  }

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const product = {
      ...form,
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    }

    try {
      const savedProduct = await requestProducts(
        editingId === null ? API_URL : `${API_URL}/${editingId}`,
        {
          method: editingId === null ? 'POST' : 'PUT',
          body: JSON.stringify(product),
        },
      )
      setProducts((current) =>
        editingId === null
          ? [...current, savedProduct]
          : current.map((item) => (item.id === editingId ? savedProduct : item)),
      )
      resetForm()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setError('')
    try {
      await requestProducts(`${API_URL}/${id}`, { method: 'DELETE' })
      setProducts((current) => current.filter((product) => product.id !== id))
      if (editingId === id) resetForm()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <div className="eyebrow">INVENTORY MANAGEMENT</div>
        <h1>Products</h1>
        <p>Manage your product list in one place.</p>
      </header>

      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          {!products.length && <button onClick={loadProducts}>Try again</button>}
        </div>
      )}

      <div className="content-grid">
        <section className="panel form-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">{editingId === null ? 'NEW ITEM' : 'UPDATE ITEM'}</div>
              <h2>{editingId === null ? 'Add a product' : 'Edit product'}</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Product name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Hand soap"
              required
            />

            <label htmlFor="brand">Brand</label>
            <input
              id="brand"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="e.g. Dettol"
            />

            <label htmlFor="price">Price</label>
            <div className="price-input">
              <span aria-hidden="true">₹</span>
              <input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={handleChange}
              placeholder="0"
              required
            />

            <div className="form-actions">
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : editingId === null ? 'Add product' : 'Save changes'}
              </button>
              {editingId !== null && (
                <button className="secondary-button" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel list-panel">
          <div className="panel-heading list-heading">
            <div>
              <div className="eyebrow">YOUR CATALOG</div>
              <h2>All products</h2>
            </div>
            <span className="count-badge">{products.length}</span>
          </div>
          {loading ? (
            <p className="empty-state">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="empty-state">No products yet. Add your first product.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="product-details">
                        <span className="product-name">{product.name}</span>
                        <span className="product-quantity">
                          Quantity: {product.quantity ?? 0}
                        </span>
                      </td>
                      <td>{product.brand || '—'}</td>
                      <td className="product-price">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 2,
                        }).format(product.price)}
                      </td>
                      <td className="row-actions">
                        <button className="text-button" onClick={() => startEditing(product)}>
                          Edit
                        </button>
                        <button className="text-button delete-button" onClick={() => handleDelete(product.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <footer>Changes are stored by the backend while it is running.</footer>
    </main>
  )
}

export default App
