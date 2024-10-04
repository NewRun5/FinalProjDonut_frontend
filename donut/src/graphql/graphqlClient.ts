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