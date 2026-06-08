const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<User>('/api/auth/me'),
  },

  users: {
    list: () => request<User[]>('/api/users'),
    get: (id: number) => request<User>(`/api/users/${id}`),
    update: (id: number, data: Partial<User>) =>
      request<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getSettings: (id: number) => request<UserSettings>(`/api/users/${id}/settings`),
    updateSettings: (id: number, data: UserSettings) =>
      request<UserSettings>(`/api/users/${id}/settings`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  locations: {
    list: () => request<Location[]>('/api/locations'),
    get: (id: number) => request<Location>(`/api/locations/${id}`),
    create: (data: Partial<Location>) =>
      request<Location>('/api/locations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Location>) =>
      request<Location>(`/api/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/api/locations/${id}`, { method: 'DELETE' }),
    vote: (id: number) =>
      request<Location>(`/api/locations/${id}/vote`, { method: 'POST' }),
    removeVote: (id: number) =>
      request<Location>(`/api/locations/${id}/vote`, { method: 'DELETE' }),
  },

  itinerary: {
    list: () => request<Location[]>('/api/itinerary'),
    add: (locationId: number) =>
      request<Location[]>('/api/itinerary', {
        method: 'POST',
        body: JSON.stringify({ location_id: locationId }),
      }),
    remove: (locationId: number) =>
      request<Location[]>(`/api/itinerary/${locationId}`, { method: 'DELETE' }),
  },

  flights: {
    list: () => request<Flight[]>('/api/flights'),
    get: (id: number) => request<Flight>(`/api/flights/${id}`),
    create: (data: Partial<Flight>) =>
      request<Flight>('/api/flights', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Flight>) =>
      request<Flight>(`/api/flights/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/api/flights/${id}`, { method: 'DELETE' }),
  },

  shopping: {
    list: (search?: string) =>
      request<ShoppingItem[]>(`/api/shopping${search ? `?q=${encodeURIComponent(search)}` : ''}`),
    get: (id: number) => request<ShoppingItem>(`/api/shopping/${id}`),
    create: (data: Partial<ShoppingItem>) =>
      request<ShoppingItem>('/api/shopping', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<ShoppingItem>) =>
      request<ShoppingItem>(`/api/shopping/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/api/shopping/${id}`, { method: 'DELETE' }),
  },

  budget: {
    list: () => request<BudgetCategory[]>('/api/budget'),
    create: (data: Partial<BudgetCategory>) =>
      request<BudgetCategory>('/api/budget', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<BudgetCategory>) =>
      request<BudgetCategory>(`/api/budget/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  accommodations: {
    list: () => request<Accommodation[]>('/api/accommodations'),
    get: (id: number) => request<Accommodation>(`/api/accommodations/${id}`),
    create: (data: Partial<Accommodation>) =>
      request<Accommodation>('/api/accommodations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Accommodation>) =>
      request<Accommodation>(`/api/accommodations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/api/accommodations/${id}`, { method: 'DELETE' }),
  },

  groups: {
    create: (data: { name: string }) =>
      request<{ token: string; group: GroupInfo }>('/api/groups', { method: 'POST', body: JSON.stringify(data) }),
    join: (data: { invite_code: string }) =>
      request<{ token: string; group: GroupInfo }>('/api/groups/join', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<GroupInfo>('/api/groups/me'),
    leave: () => request<{ token: string }>('/api/groups/me', { method: 'DELETE' }),
  },
}

// Types mirroring backend models
export interface User {
  id: number
  name: string
  email: string
  initials: string
  avatar_url: string
  color: string
  created_at: string
}

export interface UserSettings {
  user_id: number
  font: string
  contrast: string
  vlibras_enabled: boolean
  keyboard_nav_enabled: boolean
  a11y_contrast_enabled: boolean
}

export interface Location {
  id: number
  name: string
  address: string
  city: string
  duration_label: string
  duration_minutes: number
  description: string
  image_url: string
  lat: number
  lng: number
  tags: string[]
  voter_ids: number[]
  created_by: number
  in_itinerary: boolean
}

export interface FlightConnection {
  id: number
  flight_id: number
  order_index: number
  title: string
  location: string
  arrival_time: string
  departure_time: string
}

export interface Flight {
  id: number
  airline: string
  category: string
  airport: string
  departure_date: string
  return_date: string
  connection_count: number
  travel_duration: string
  price: number
  currency: string
  logo_url: string
  color: string
  added_by: number
  connections: FlightConnection[]
}

export interface ShoppingItem {
  id: number
  name: string
  description: string
  location: string
  price: number
  currency: string
  image_url: string
  tags: string[]
  added_by: number
}

export interface Accommodation {
  id: number
  name: string
  type: string
  address: string
  city: string
  check_in: string
  check_out: string
  nights: number
  price_per_night: number
  total_price: number
  currency: string
  rating: number
  image_url: string
  notes: string
  tags: string[]
  added_by: number
  created_at: string
}

export interface BudgetCategory {
  id: number
  name: string
  amount: number
  currency: string
  percentage: number
}

export interface Group {
  id: number
  name: string
  invite_code: string
  created_by: number
  created_at: string
}

export interface GroupInfo {
  group: Group
  members: User[]
}
