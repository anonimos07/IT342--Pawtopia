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
    productType: ''
  });
  const [newProduct, setNewProduct] = useState({
    productName: '',
    description: '',
    productPrice: 0,
    quantity: 0,
    productImage: '',
    productType: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/product/getProduct");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/product/postProduct", 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProduct)
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      if (response.status === 200 || response.status === 201) {
        fetchProducts();
        setNewProduct({
          productName: '',
          description: '',
          productPrice: 0,
          quantity: 0,
          productImage: '',
          productType: ''
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setError(error.message || "Failed to create product");
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.productID);
    setEditForm({
      productName: product.productName,
      description: product.description,
      productPrice: product.productPrice,
      quantity: product.quantity,
      productImage: product.productImage || '',
      productType: product.productType || ''
    });
  };

  const handleUpdate = async (productId) => {
    try {
      // Get the authentication token (if using JWT)
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `http://localhost:8080/api/product/putProduct/${productId}`,
        {
          method: 'PUT',
          credentials: 'include', // For cookie-based auth
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }) // Add if token exists
          },
          body: JSON.stringify(editForm)
        }
      );
  
      // Handle empty responses
      if (response.status === 204) { // No Content
        fetchProducts();
        setEditingId(null);
        return;
      }
  
      // Handle JSON responses
      const data = await response.json().catch(() => ({})); // Fallback if no JSON
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }
  
      fetchProducts();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating product:", error);
      setError(error.message || "Failed to update product");
      
      // Optional: Handle specific auth errors
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        // You can choose to show an error instead of redirecting
        setError('Please log in to update products');
        // Or redirect if you prefer:
        // navigate('/login');
      }
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/product/deleteProduct/${productId}`,
        {
          method: 'DELETE',
          credentials: 'include', // For cookies (if using session-based auth)
          headers: {
            'Content-Type': 'application/json',
            // If using JWT, uncomment:
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        }
      );
  
      if (!response.ok) {
        let errorMessage = "Failed to delete product";
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
  
        throw new Error(errorMessage);
      }
  
      // If successful, refresh the product list
      await fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.message); // Show error without redirecting
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
                  onChange={(e) => setNewProduct({...newProduct, productPrice: parseFloat(e.target.value) || 0})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})}
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
                <tr key={product.productID}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.productID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productID ? (
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
                    {editingId === product.productID ? (
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
                    {editingId === product.productID ? (
                      <input
                        type="number"
                        value={editForm.productPrice}
                        onChange={(e) => setEditForm({...editForm, productPrice: parseFloat(e.target.value) || 0})}
                        className="border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      `$${product.productPrice?.toFixed(2) || '0.00'}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productID ? (
                      <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value) || 0})}
                        className="border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      product.quantity
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productID ? (
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
                    {editingId === product.productID ? (
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
                    {editingId === product.productID ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(product.productID)}
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
                          onClick={() => handleDelete(product.productID)}
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