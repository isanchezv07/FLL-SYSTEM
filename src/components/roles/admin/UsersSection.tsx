import CreateUserForm from './CreateUserForm'
import UsersTable from './UsersTable';

export default function UsersSection({ users, refresh }) {
  return (
    <div className="space-y-6">
      <CreateUserForm refresh={refresh} />
      <UsersTable users={users} refresh={refresh} />
    </div>
  );
}