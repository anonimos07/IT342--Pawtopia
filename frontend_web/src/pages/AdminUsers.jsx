import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:8080/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.userId);
    setEditForm({
      username: user.username,
      password: '', // Password is typically not shown when editing
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role || ''
    });
  };

  const handleUpdate = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError("Unauthorized: No admin token found");
        return;
      }
  
      // Only send fields that should be updated (excluding password if empty)
      const updateData = { ...editForm };
      if (!updateData.password) {
        delete updateData.password;
      }
  
      const response = await axios.put(
        `http://localhost:8080/admin/update/${userId}`,  // Changed to match backend endpoint
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200 || response.status === 204) {
        fetchUsers();
        setEditingId(null);
      } else {
        throw new Error("Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.response?.data || err.message || "Failed to update user");
    }
  };
  
  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the user "${users.find(u => u.userId === userId)?.username}"?`
    );
    
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError("Unauthorized: No admin token found");
        return;
      }
  
      const response = await axios.delete(
        `http://localhost:8080/admin/delete/${userId}`,  // Changed to match backend endpoint
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status === 200 || response.status === 204) {
        fetchUsers();
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data || err.message || "Failed to delete user");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {typeof error === 'object' ? JSON.stringify(error) : error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <button 
            onClick={() => navigate('/adminDashboard')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.userId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                        required
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                        required
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      user.firstName || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      user.lastName || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="border rounded px-2 py-1"
                        disabled
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === user.userId ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(user.userId)}
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
                          onClick={() => handleEdit(user)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.userId)}
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

export default AdminUsers;