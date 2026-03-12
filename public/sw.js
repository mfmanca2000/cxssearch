// CSX Search Service Worker — push + notification click handling

self.addEventListener('push', function (event) {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'New notification', body: event.data.text(), url: '/' }
  }

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        // If any client is focused, skip OS notification — in-app toast handles it
        const hasFocused = clientList.some(function (c) {
          return c.focused
        })
        if (hasFocused) return

        return self.registration.showNotification(payload.title, {
          body: payload.body,
          icon: '/logo.webp',
          badge: '/favicon.svg',
          data: { url: payload.url },
        })
      }),
  )
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url)
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      }),
  )
})
