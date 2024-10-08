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
    const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: `
              mutation Logout {
                logout
              }
            `,
        }),
        credentials: 'include',  // 세션 쿠키가 필요한 경우 설정
    });

    const result = await response.json();
    return result.data.logout;
}


//사용자 프로필 정보 가져오기
export async function fetchUserProfile() {
    const query = `
    query {
      userProfile {
        id
        nickname
        email
      }
    }
  `;

    const response = await fetch('http://localhost:8080/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        credentials: 'include', // 세션 쿠키 포함
    });

    if (response.ok) {
        const result = await response.json();
        return result.data.userProfile; // 프로필 정보 반환
    } else {
        return null; // 실패 시 null 반환
    }
}