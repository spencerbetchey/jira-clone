import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notifications'

const POLL_INTERVAL_MS = 45000

function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  //Close the dropdown if the user clicks anywhere outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications()
      setNotifications(data)
    } catch (err) {
      console.error('Failed to load notifications')
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const handleNotificationClick = async (notification) => {
    setOpen(false)
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id)
        setNotifications(notifications.map(n =>
          n.id === notification.id ? { ...n, is_read: 1 } : n
        ))
      } catch (err) {
        console.error('Failed to mark notification as read')
      }
    }
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })))
    } catch (err) {
      console.error('Failed to mark all as read')
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const seconds = Math.floor((new Date() - date) / 1000)

    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-white hover:text-blue-200 transition-colors text-lg"
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 text-left">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    {!notification.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-200">{notification.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell