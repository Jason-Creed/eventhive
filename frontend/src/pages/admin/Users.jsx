import { useEffect, useState } from 'react';
import { usersAPI } from '@/services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await usersAPI.getAllUsers();
        setUsers(res.data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container"><div className="loading">Loading users…</div></div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Users</h1>
        <span className="nav-user">{users.length} total</span>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!error && users.length === 0 ? (
        <div className="empty-state"><p>No users found.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>{u.role}</span>
                  </td>
                  <td className="admin-table-date">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" disabled title="Coming soon">
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
