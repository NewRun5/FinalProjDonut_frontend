export async function getServerSideProps() {
  // const markdownData = await fetchMarkdownDataFromMongoDB();  // MongoDB에서 데이터 fetch
  // const unitData = await fetchUnitDataFromGraphQL();  // GraphQL에서 단원 데이터 fetch

  return {
    props: {
      // markdownData,
      // unitData,
    },
  };
}
