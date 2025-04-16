import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    productName: '',
    description: '',
    productPrice: 0,
    quantity: 0,
    productImage: '',
    productType: 'general'
  });
  const [newProduct, setNewProduct] = useState({
    productName: '',
    description: '',
    productPrice: 0,
    quantity: 0,
    productImage: '',
    productType: 'general'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:8080/api/product/getProduct', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.ProductID);
    setEditForm({
      productName: product.productName,
      description: product.description,
      productPrice: product.productPrice,
      quantity: product.quantity,
      productImage: product.productImage,
      productType: product.productType || 'general'
    });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:8080/api/product/putProduct/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }
      
      const updatedProduct = await response.json();
      setProducts(products.map(product => 
        product.ProductID === id ? updatedProduct : product
      ));
      setEditingId(null);
    } catch (err) {
      setError(err.message);
      console.error('Update error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:8080/api/product/deleteProduct/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Delete failed');
        }
        
        setProducts(products.filter(product => product.ProductID !== id));
      } catch (err) {
        setError(err.message);
        console.error('Delete error:', err);
      }
    }
  };

  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8080/api/product/postProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          quantitySold: 0
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Add product failed');
      }
      
      const addedProduct = await response.json();
      setProducts([...products, addedProduct]);
      setNewProduct({ 
        productName: '',
        description: '',
        productPrice: 0,
        quantity: 0,
        productImage: '',
        productType: 'general'
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
      console.error('Add product error:', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/adminDashboard')}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {showAddForm ? 'Cancel' : 'Add New Product'}
            </button>
          </div>
        </div>
        
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({...newProduct, productName: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  value={newProduct.productPrice}
                  onChange={(e) => setNewProduct({...newProduct, productPrice: parseFloat(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                <input
                  type="text"
                  value={newProduct.productType}
                  onChange={(e) => setNewProduct({...newProduct, productType: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newProduct.productImage}
                  onChange={(e) => setNewProduct({...newProduct, productImage: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.ProductID}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.ProductID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.ProductID ? (
                      <input
                        type="text"
                        value={editForm.productName}
                        onChange={(e) => setEditForm({...editForm, productName: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      product.productName
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {editingId === product.ProductID ? (
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full border rounded px-2 py-1"
                        rows="2"
                      />
                    ) : (
                      product.description
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.ProductID ? (
                      <input
                        type="number"
                        value={editForm.productPrice}
                        onChange={(e) => setEditForm({...editForm, productPrice: parseFloat(e.target.value)})}
                        className="border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      `$${product.productPrice.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.ProductID ? (
                      <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value)})}
                        className="border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      product.quantity
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.ProductID ? (
                      <input
                        type="text"
                        value={editForm.productType}
                        onChange={(e) => setEditForm({...editForm, productType: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      product.productType || 'general'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.ProductID ? (
                      <input
                        type="text"
                        value={editForm.productImage}
                        onChange={(e) => setEditForm({...editForm, productImage: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      product.productImage && (
                        <img 
                          src={product.productImage} 
                          alt={product.productName} 
                          className="h-10 w-10 object-cover rounded"
                        />
                      )
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.ProductID ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(product.ProductID)}
                          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.ProductID)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;