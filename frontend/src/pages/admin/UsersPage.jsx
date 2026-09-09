import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/userApi';
import { getCooperatives } from '../../api/cooperativeApi';
import { getFamiliesByCooperative } from '../../api/memberApi';
import { FaPlus, FaEdit, FaTrash, FaUserShield, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [cooperatives, setCooperatives] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'admin',
    cooperative_id: '',
    family_id: '',
    status: 'active'
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, coopsRes] = await Promise.all([
        getUsers(),
        getCooperatives()
      ]);
      setUsers(usersRes.data || []);
      setCooperatives(coopsRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load users data.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        username: user.username,
        password: '', // Don't populate password on edit
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role,
        cooperative_id: user.cooperative_id || '',
        family_id: user.family_id || '',
        status: user.status || 'active'
      });
      if (user.cooperative_id) {
        fetchFamilies(user.cooperative_id);
      } else {
        setFamilies([]);
      }
    } else {
      setCurrentUser(null);
      setFormData({
        username: '',
        password: '',
        full_name: '',
        email: '',
        role: 'admin',
        cooperative_id: '',
        family_id: '',
        status: 'active'
      });
      setFamilies([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleOpenDeleteModal = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentUser(null);
  };

  const fetchFamilies = async (cooperativeId) => {
    if (!cooperativeId) {
      setFamilies([]);
      return;
    }
    try {
      const response = await getFamiliesByCooperative(cooperativeId);
      setFamilies(response.data || []);
    } catch (err) {
      console.error('Error fetching families:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Clear downstream fields when role or cooperative changes
      if (name === 'role') {
        if (value === 'admin') {
          newData.cooperative_id = '';
          newData.family_id = '';
        } else if (value === 'leader') {
          newData.family_id = '';
        }
      }
      
      if (name === 'cooperative_id') {
        newData.family_id = '';
      }
      
      return newData;
    });

    if (name === 'cooperative_id') {
      fetchFamilies(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || (!currentUser && !formData.password)) {
      alert('Username and password are required for new users.');
      return;
    }

    if (formData.role === 'leader' && !formData.cooperative_id) {
      alert('Please select a cooperative for the leader.');
      return;
    }

    if (['family_leader', 'member'].includes(formData.role) && (!formData.cooperative_id || !formData.family_id)) {
      alert('Please select both a cooperative and a family for this role.');
      return;
    }

    try {
      setSubmitting(true);
      if (currentUser) {
        // Only send password if it was filled out (changed)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateUser(currentUser.user_id, updateData);
      } else {
        await createUser(formData);
      }
      await fetchData();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving user:', err);
      alert(err.response?.data?.message || 'Failed to save user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await deleteUser(currentUser.user_id);
      await fetchData();
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserShield className="text-blue-600" /> User Accounts Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage system administrators and cooperative leaders.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Add New User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Username</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Full Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Assigned To</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{u.username}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {u.full_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      u.role === 'leader' ? 'bg-blue-100 text-blue-700' : 
                      'bg-green-100 text-green-700'
                    }`}>
                      {(u.role || '').replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {u.role === 'leader' ? (
                      <div><span className="font-semibold">Coop:</span> {u.cooperative_name || 'N/A'}</div>
                    ) : u.role === 'family_leader' ? (
                      <div>
                        <div><span className="font-semibold">Coop:</span> {u.cooperative_name || 'N/A'}</div>
                        <div><span className="font-semibold">Family:</span> {u.family_name || 'N/A'}</div>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleOpenModal(u)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(u)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {currentUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {currentUser ? '(Leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required={!currentUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="leader">Cooperative Leader</option>
                    <option value="family_leader">Family Leader</option>
                    <option value="member">Member</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {['leader', 'family_leader', 'member'].includes(formData.role) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Cooperative *</label>
                  <select
                    name="cooperative_id"
                    value={formData.cooperative_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Cooperative...</option>
                    {cooperatives.map(c => (
                      <option key={c.cooperative_id} value={c.cooperative_id}>
                        {c.cooperative_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {['family_leader', 'member'].includes(formData.role) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Family *</label>
                  <select
                    name="family_id"
                    value={formData.family_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    disabled={!formData.cooperative_id}
                  >
                    <option value="">Select Family...</option>
                    {families.map(f => (
                      <option key={f.family_id} value={f.family_id}>
                        {f.family_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                  disabled={submitting}
                >
                  {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Delete User</h2>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete the user <span className="font-semibold text-gray-700">{currentUser?.username}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors w-full"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors w-full"
                disabled={submitting}
              >
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
