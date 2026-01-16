# 💻 Ejemplos de Integración - SerPlantas Backend

## JavaScript/Fetch API

```javascript
// Cliente HTTP reutilizable
class SerPlantasAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.token = null;
  }

  async register(firstName, secondName, lastName, secondLastName, email, password) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        secondName,
        lastName,
        secondLastName,
        email,
        password
      })
    });
    const data = await response.json();
    this.token = data.accessToken;
    return data;
  }

  async login(username, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    
    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true, tempToken: data.accessToken };
    }
    
    this.token = data.accessToken;
    return data;
  }

  async getQRCode() {
    const response = await fetch(`${this.baseURL}/auth/2fa/setup`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return await response.json();
  }

  async enableTwoFactor(code) {
    const response = await fetch(`${this.baseURL}/auth/2fa/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ code })
    });
    return await response.json();
  }

  async loginWith2FA(tempToken, code) {
    const response = await fetch(`${this.baseURL}/auth/login-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tempToken, code })
    });
    const data = await response.json();
    this.token = data.accessToken;
    return data;
  }

  async getProfile() {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return await response.json();
  }
}

// Uso
(async () => {
  const api = new SerPlantasAPI();
  
  // Registrar
  const user = await api.register(
    'Juan', 'Carlos', 'González', 'Rodríguez',
    'juan@example.com', 'Seguro123!'
  );
  console.log('Usuario creado:', user.user.username);
})();
```

---

## TypeScript/Axios

```typescript
import axios, { AxiosInstance } from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
}

class SerPlantasClient {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.api = axios.create({ baseURL });
  }

  async register(
    firstName: string,
    secondName: string,
    lastName: string,
    secondLastName: string,
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string }> {
    const { data } = await this.api.post('/auth/register', {
      firstName,
      secondName,
      lastName,
      secondLastName,
      email,
      password
    });
    this.token = data.accessToken;
    return data;
  }

  async login(username: string, password: string) {
    const { data } = await this.api.post('/auth/login', {
      username,
      password
    });
    
    if (!data.requiresTwoFactor) {
      this.token = data.accessToken;
    }
    
    return data;
  }

  async getProfile() {
    const { data } = await this.api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return data;
  }

  setToken(token: string) {
    this.token = token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

// Uso
(async () => {
  const client = new SerPlantasClient();
  const user = await client.register(
    'Juan', 'Carlos', 'González', 'Rodríguez',
    'juan@example.com', 'Seguro123!'
  );
  console.log('Usuario:', user.user.username);
})();
```

---

## React Hook

```typescript
import { useState, useCallback } from 'react';

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useSerPlantasAuth = (baseURL = 'http://localhost:3000') => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: false,
    error: null
  });

  const register = useCallback(async (
    firstName: string,
    secondName: string,
    lastName: string,
    secondLastName: string,
    email: string,
    password: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          secondName,
          lastName,
          secondLastName,
          email,
          password
        })
      });
      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        user: data.user,
        token: data.accessToken,
        loading: false
      }));
      
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, [baseURL]);

  const login = useCallback(async (username: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (!data.requiresTwoFactor) {
        setState(prev => ({
          ...prev,
          user: data.user,
          token: data.accessToken,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          token: data.accessToken,
          loading: false
        }));
      }
      
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setState(prev => ({ ...prev, error: message, loading: false }));
      throw error;
    }
  }, [baseURL]);

  return { ...state, register, login };
};

// Uso en componente
function LoginPage() {
  const { user, token, loading, error, login } = useSerPlantasAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... obtener username y password del formulario
    await login('jgonzález', 'Seguro123!');
  };

  return (
    <div>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user && <p>¡Hola {user.username}!</p>}
      {/* formulario */}
    </div>
  );
}
```

---

## Python

```python
import requests
import json
from typing import Optional, Dict, Any

class SerPlantasAPI:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.session = requests.Session()

    def register(
        self,
        first_name: str,
        second_name: str,
        last_name: str,
        second_last_name: str,
        email: str,
        password: str
    ) -> Dict[str, Any]:
        """Registrar nuevo usuario"""
        response = self.session.post(
            f"{self.base_url}/auth/register",
            json={
                "firstName": first_name,
                "secondName": second_name,
                "lastName": last_name,
                "secondLastName": second_last_name,
                "email": email,
                "password": password
            }
        )
        data = response.json()
        self.token = data.get("accessToken")
        return data

    def login(self, username: str, password: str) -> Dict[str, Any]:
        """Iniciar sesión"""
        response = self.session.post(
            f"{self.base_url}/auth/login",
            json={"username": username, "password": password}
        )
        data = response.json()
        
        if not data.get("requiresTwoFactor"):
            self.token = data.get("accessToken")
        
        return data

    def get_2fa_qr(self) -> Dict[str, Any]:
        """Obtener código QR para 2FA"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.get(
            f"{self.base_url}/auth/2fa/setup",
            headers=headers
        )
        return response.json()

    def enable_2fa(self, code: str) -> Dict[str, Any]:
        """Habilitar 2FA"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.post(
            f"{self.base_url}/auth/2fa/enable",
            json={"code": code},
            headers=headers
        )
        return response.json()

    def get_profile(self) -> Dict[str, Any]:
        """Obtener perfil del usuario"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = self.session.get(
            f"{self.base_url}/auth/profile",
            headers=headers
        )
        return response.json()

# Uso
if __name__ == "__main__":
    api = SerPlantasAPI()
    
    # Registrar
    user_data = api.register(
        "Juan", "Carlos", "González", "Rodríguez",
        "juan@example.com", "Seguro123!"
    )
    print(f"Usuario creado: {user_data['user']['username']}")
    
    # Obtener perfil
    profile = api.get_profile()
    print(f"Perfil: {profile}")
```

---

## cURL One-Liners

```bash
# Registrar
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Juan","secondName":"Carlos","lastName":"González","secondLastName":"Rodríguez","email":"juan@example.com","password":"Seguro123!"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jgonzález","password":"Seguro123!"}'

# Obtener perfil (requiere token)
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer {TU_TOKEN}"

# Setup 2FA
curl -X GET http://localhost:3000/auth/2fa/setup \
  -H "Authorization: Bearer {TU_TOKEN}"

# Habilitar 2FA
curl -X POST http://localhost:3000/auth/2fa/enable \
  -H "Authorization: Bearer {TU_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'

# Login con 2FA
curl -X POST http://localhost:3000/auth/login-2fa \
  -H "Content-Type: application/json" \
  -d '{"token":"{TEMP_TOKEN}","code":"123456"}'
```

---

## Vue 3 Composable

```typescript
import { ref, reactive } from 'vue';

export function useSerPlantasAuth(baseURL = 'http://localhost:3000') {
  const state = reactive({
    user: null as any,
    token: null as string | null,
    tempToken: null as string | null,
    loading: false,
    error: null as string | null
  });

  const register = async (
    firstName: string,
    secondName: string,
    lastName: string,
    secondLastName: string,
    email: string,
    password: string
  ) => {
    state.loading = true;
    state.error = null;
    
    try {
      const response = await fetch(`${baseURL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          secondName,
          lastName,
          secondLastName,
          email,
          password
        })
      });
      
      const data = await response.json();
      state.user = data.user;
      state.token = data.accessToken;
      return data;
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Error';
      throw error;
    } finally {
      state.loading = false;
    }
  };

  const login = async (username: string, password: string) => {
    state.loading = true;
    state.error = null;
    
    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (data.requiresTwoFactor) {
        state.tempToken = data.accessToken;
      } else {
        state.user = data.user;
        state.token = data.accessToken;
      }
      
      return data;
    } catch (error) {
      state.error = error instanceof Error ? error.message : 'Error';
      throw error;
    } finally {
      state.loading = false;
    }
  };

  return { state, register, login };
}

// Uso en componente
<script setup lang="ts">
import { useSerPlantasAuth } from '@/composables/useSerPlantasAuth';

const { state, login } = useSerPlantasAuth();

const handleLogin = async () => {
  await login('jgonzález', 'Seguro123!');
  if (state.user) {
    console.log('¡Conectado!');
  }
};
</script>
```

---

## C# / .NET

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class SerPlantasClient
{
    private readonly HttpClient _httpClient;
    private string _token;

    public SerPlantasClient(string baseUrl = "http://localhost:3000")
    {
        _httpClient = new HttpClient { BaseAddress = new Uri(baseUrl) };
    }

    public async Task<dynamic> RegisterAsync(
        string firstName,
        string secondName,
        string lastName,
        string secondLastName,
        string email,
        string password)
    {
        var payload = new
        {
            firstName,
            secondName,
            lastName,
            secondLastName,
            email,
            password
        };

        var content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _httpClient.PostAsync("/auth/register", content);
        var json = await response.Content.ReadAsStringAsync();
        
        var data = JsonSerializer.Deserialize<dynamic>(json);
        _token = data.GetProperty("accessToken").GetString();
        
        return data;
    }

    public async Task<dynamic> LoginAsync(string username, string password)
    {
        var payload = new { username, password };
        var content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _httpClient.PostAsync("/auth/login", content);
        return JsonSerializer.Deserialize<dynamic>(
            await response.Content.ReadAsStringAsync()
        );
    }

    public async Task<dynamic> GetProfileAsync()
    {
        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _token);

        var response = await _httpClient.GetAsync("/auth/profile");
        return JsonSerializer.Deserialize<dynamic>(
            await response.Content.ReadAsStringAsync()
        );
    }
}

// Uso
var client = new SerPlantasClient();
var user = await client.RegisterAsync(
    "Juan", "Carlos", "González", "Rodríguez",
    "juan@example.com", "Seguro123!"
);
Console.WriteLine($"Usuario creado: {user}");
```

---

## Postman Pre-request Script

```javascript
// Ejecutar antes de probar endpoints con auth

const baseUrl = 'http://localhost:3000';

// Registrar y obtener token
fetch(`${baseUrl}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Test',
    secondName: 'User',
    lastName: 'Postman',
    secondLastName: 'Api',
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123!'
  })
})
.then(r => r.json())
.then(data => {
  pm.environment.set('access_token', data.accessToken);
  pm.environment.set('username', data.user.username);
  console.log('Token obtenido');
});
```

---

## GraphQL Query (Ejemplo para cliente futuro)

```graphql
query GetProfile($token: String!) {
  auth {
    profile(token: $token) {
      id
      username
      email
      twoFactorEnabled
    }
  }
}

mutation Register(
  $firstName: String!
  $secondName: String!
  $lastName: String!
  $secondLastName: String!
  $email: String!
  $password: String!
) {
  auth {
    register(
      firstName: $firstName
      secondName: $secondName
      lastName: $lastName
      secondLastName: $secondLastName
      email: $email
      password: $password
    ) {
      user {
        id
        username
      }
      accessToken
    }
  }
}
```

---

Estos ejemplos muestran cómo integrar el backend con diferentes tecnologías y lenguajes.

¡Elige el que mejor se adapte a tu stack! 🚀
