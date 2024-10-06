// src/graphql/queries.ts

// 클릭한 대화의 날짜에 해당하는 대화 내역 조회
// GraphQL 쿼리 정의
export const GET_CHAT_HISTORY_BY_DATE = `
  query GetChatHistoryByDate($date: String!) {
    getChatHistoryByDate(date: $date) {
      id
      content
      isUser
      createDate
    }
  }
`;

// GraphQL 요청 함수
export async function fetchChatHistoryByDate(date: string) {
  const query = GET_CHAT_HISTORY_BY_DATE;

  const response = await fetch('http://localhost:8080/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { date },
    }),
  });

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    return null;
  }

  const result = await response.json();
  return result.data?.getChatHistoryByDate;
}


// 모든 대화내역에서 사용자의 질문 항목만 조회
export const GET_ALL_CHAT_HISTORIES = `
  query GetAllChatHistories {
    getAllChatHistories {
      id
      content
      isUser
      createDate
    }
  }
`;

export async function fetchAllChatHistories() {
  const query = GET_ALL_CHAT_HISTORIES;

  const response = await fetch('http://localhost:8080/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  });

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    return null;
  }

  const result = await response.json();
  return result.data?.getAllChatHistories;
}




// export async function getServerSideProps() {
//   // const markdownData = await fetchMarkdownDataFromMongoDB();  // MongoDB에서 데이터 fetch
//   // const unitData = await fetchUnitDataFromGraphQL();  // GraphQL에서 단원 데이터 fetch

//   return {
//     props: {
//       // markdownData,
//       // unitData,
//     },
//   };
// }
