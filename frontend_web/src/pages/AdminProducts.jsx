import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';
const API_BASE_URL_ADMIN_PRODUCT = import.meta.env.VITE_API_BASE_URL_PRODUCT;


const AdminProducts = () => {
  const [username, setUsername] = useState('Admin');
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
      const response = await fetch(`${API_BASE_URL_ADMIN_PRODUCT}/getProduct`);
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
      const token = localStorage.getItem("adminToken"); // Retrieve the token
      if (!token) {
        setError("Unauthorized: No admin token found");
        return;
      }
  
      const response = await fetch(
        `${API_BASE_URL_ADMIN_PRODUCT}/postProduct`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProduct)
        }
      );
  
      // Check if the response contains JSON
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create product");
      }
  
      const data = await response.json();
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

 // In AdminProducts.jsx, replace your existing handleUpdate with this:

const handleUpdate = async (productId) => {
  try {
    // 1️⃣ Grab the admin token you saved at login
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setError("Unauthorized: No admin token found");
      return;
    }

    // 2️⃣ Send the update via axios, passing your editForm as the body
    const response = await axios.put(
      `${API_BASE_URL_ADMIN_PRODUCT}/putProduct/${productId}`,
      editForm,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 3️⃣ If it succeeds, refresh and exit edit mode
    if (response.status === 200 || response.status === 204) {
      console.log("Product updated successfully");
      fetchProducts();
      setEditingId(null);
    } else {
      throw new Error("Failed to update product");
    }

    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Make sure you're logged in as admin.");
      }
    };
  
  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("Unauthorized: No admin token found");
        return;
      }
  
      const response = await axios.delete(
        `${API_BASE_URL_ADMIN_PRODUCT}/deleteProduct/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200 || response.status === 204) {
        console.log("Deleted successfully");
        fetchProducts(); // refresh the list
      } else {
        throw new Error("Failed to delete product");
      }
  
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete product. Make sure you're logged in as admin.");
    }
  };

  const handleLogout = () => {
    // Additional logout logic can go here
    console.log('Admin logged out');
  };
  
  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-6xl animate-bounce mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-700">Loading Pawtopia Inventory...</h2>
        <p className="text-gray-500 mt-2">Fetching all the goodies for your pets!</p>
      </div>
    </div>
  );

  if (error) return <div>Error: {error}</div>;if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader username={username} onLogout={handleLogout} />
      
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
              <select
                value={newProduct.productType}
                onChange={(e) => setNewProduct({...newProduct, productType: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select a type</option>
                <option value="Toys">Toys</option>
                <option value="Fur Clothing">Fur Clothing</option>
                <option value="Care Products">Care Products</option>
                <option value="Foods">Foods</option>
              </select>
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setNewProduct({ ...newProduct, productImage: event.target.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
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
                     <select
                     value={editForm.productType}
                     onChange={(e) => setEditForm({...editForm, productType: e.target.value})}
                     className="border rounded px-2 py-1 w-full"
                   >
                     <option value="">Select a type</option>
                     <option value="Toys">Toys</option>
                     <option value="Fur Clothing">Fur Clothing</option>
                     <option value="Care Products">Care Products</option>
                     <option value="Foods">Foods</option>
                   </select>
                   
                    ) : (
                      product.productType || 'general'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productID ? (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setEditForm({ ...editForm, productImage: event.target.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
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
                          onClick={() => {
                            const confirmDelete = window.confirm(
                              `Are you sure you want to delete the product "${product.productName}"?`
                            );
                            if (confirmDelete) handleDelete(product.productID);
                          }}
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