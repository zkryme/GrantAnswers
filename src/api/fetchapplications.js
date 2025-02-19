const axios = require('axios');

// The GraphQL query to fetch application IDs
const queryFetchIds = `
  query Applications($chainId: Int!, $roundId: String!) {
    applications(
      condition: {
        chainId: $chainId
        roundId: $roundId
      }
    ) {
      id
    }
  }
`;

// The serverless API function
export default async function fetchApplications(req, res) {
  try {
    // Extract the roundId and chainId from the query params or use defaults
    const { roundId = '11', chainId = 1329 } = req.query;

    // First API call to fetch application IDs
    const responseFetchIds = await axios.post('https://grants-stack-indexer-v2.gitcoin.co/graphql', {
      query: queryFetchIds,
      variables: { chainId, roundId },
    });

    // Extract application IDs
    const applicationIds = responseFetchIds.data.data.applications.map((app) => app.id);

    if (applicationIds.length === 0) {
      return res.status(404).json({ message: 'No application IDs found.' });
    }

    // Second API call to fetch detailed data based on application IDs
    const response = await axios.post('https://grants-stack-indexer-v2.gitcoin.co/graphql', {
      query: `
        query getRoundForExplorer($roundId: String!, $chainId: Int!) {
          rounds(
            first: 1
            filter: { id: { equalTo: $roundId }, chainId: { equalTo: $chainId } }
          ) {
            applications(first: 1000) {
              id
              projectId
              status
              metadata
              anchorAddress
              project: canonicalProject {
                id
                metadata
                anchorAddress
              }
            }
          }
        }
      `,
      variables: { roundId, chainId },
    });

    // Format the response data
    const applicationsStatus = response.data.data.rounds.flatMap((round) =>
      round.applications.map((application) => ({
        id: application.id,
        projectId: application.projectId,
        status: application.status,
        name: application.project.metadata?.title || 'No title',
        website: application.project.metadata?.website || 'No website',
        anchorAddress: application.anchorAddress,
        recipient: application.metadata?.application?.recipient || 'No recipient',
        fund_link: `https://explorer.gitcoin.co/#/round/${chainId}/9/${application.id}`,
        answers: application.metadata?.application?.answers || 'No answers',
      }))
    );

    // Return the data as JSON
    return res.status(200).json(applicationsStatus);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    if (error.response && error.response.data) {
      return res.status(error.response.status).json({ error: error.response.data.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
