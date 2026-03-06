import SimpleUserManager from './SimpleUserManager';

export default function UsersSection({ users, refresh }: { users: any[], refresh: () => void }) {
  return <SimpleUserManager users={users} refresh={refresh} />;
}