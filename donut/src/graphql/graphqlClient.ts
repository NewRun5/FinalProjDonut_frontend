import { useRouter } from "next/router";

export async function login(userId: string, password: string) {
  const query = `
    mutation {
      login(userId: "${userId}", password: "${password}")
    }
  `;

  const response = await fetch('http://localhost:8080/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    credentials: 'include', // 세션이나 쿠키가 필요한 경우 설정
  });

  const result = await response.json();
  return result.data;
}
export async function logout() {
  const query = `
    mutation {
      logout
    }
  `
  console.log(query)
  const response = await fetch('http://localhost:8080/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    credentials: 'include', // 세션이나 쿠키가 필요한 경우 설정
  });
  const result = await response.json()
  console.log(result.data)
}
export async function checkLoginStatus() {
  try {
      const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `mutation { checkSession }`
        }),
        credentials: 'include', // 세션이나 쿠키가 필요한 경우 설정
      });
      const result = await response.json();
      const isLogin = result.data.checkSession;
      if (isLogin == "true") {
          return true
      } else {
          return false
        }
      } catch (error) {
      return false
  }
}
export async function getUserBySession() {
  try {
    const response = await fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        query: `query {
          getUserBySession {
            id
            nickname
          }
        }`
      }),
      credentials: 'include'
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    const data = result.data.getUserBySession;
    return data;

  } catch (error) {
    console.error('Fetch error:', error);
  }
}
export async function getAllChapters() {
  try {
    const response = await fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        query: `query {
          getAllChapters {
            id
            title
            createDate
            chatList {
              id
              content
              isUser
              createDate
            }
          }
        }
      `
      }),
      credentials: 'include'
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      throw new Error(result.errors[0].message);
    }

    const data = result.data.getAllChapters;
    return data;

  } catch (error) {
    console.error('Fetch error:', error);
  }
}