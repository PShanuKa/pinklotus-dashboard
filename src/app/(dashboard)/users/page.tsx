'use client';

import { useEffect, useState } from "react";
import { getUsers, deleteUser, updateUserRole } from "@/lib/api/users.api";
import { FiTrash2, FiLoader, FiShield, FiUser } from "react-icons/fi";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuthStore } from "@/lib/store/auth.store";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.user);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    const toastId = toast.loading("Deleting user...");
    try {
      await deleteUser(id);
      toast.success("User deleted successfully", { id: toastId });
      setUsers(users.filter(u => u.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete user", { id: toastId });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot change your own role");
      return;
    }

    const toastId = toast.loading("Updating role...");
    try {
      await updateUserRole(userId, newRole);
      toast.success("Role updated successfully", { id: toastId });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update role", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system administrators and registered customers.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FiLoader className="animate-spin text-blue-600" size={30} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No users found in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  
                  return (
                    <tr key={user.id} className={`hover:bg-gray-50 ${isSelf ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                            {user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? <FiShield size={20} /> : <FiUser size={20} />}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name} {isSelf && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">You</span>}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={isSelf}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-none focus:ring-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${
                            user.role === 'SUPER_ADMIN' ? 'bg-indigo-100 text-indigo-800' :
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleDelete(user.id)} 
                          disabled={isSelf}
                          className="text-red-600 hover:text-red-900 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
