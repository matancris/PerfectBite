import { useAuthStore } from '@/stores/auth.store'

export function AdminHeader() {
  const { user, signOut } = useAuthStore()

  return (
    <header className="admin-header">
      <div className="admin-header__container">
        <h1 className="admin-header__title">ניהול המערכת</h1>

        <div className="admin-header__user">
          {user && (
            <>
              <span className="admin-header__user-name">{user.email}</span>
              <button
                onClick={signOut}
                className="admin-header__logout"
              >
                התנתק
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
