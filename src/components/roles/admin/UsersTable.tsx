export default function UsersTable({ users, refresh }) {
    const handleDelete = async (id: string) => {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
  
      refresh();
    };
  
    return (
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Username</th>
            <th className="p-2">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.username}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">
                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
}