import Arweave from 'arweave';

export const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

export function formatAr(winston: string): string {
  try {
    return Number(arweave.ar.winstonToAr(winston)).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });
  } catch {
    return '0';
  }
}

export async function fetchRecentTransactionsByAddress(address: string, limit = 5) {
  const query = {
    query: `
      query($owners: [String!], $first: Int!) {
        transactions(owners: $owners, first: $first, sort: HEIGHT_DESC) {
          edges {
            node {
              id
              owner { address }
              tags { name value }
              block { height timestamp }
            }
          }
        }
      }
    `,
    variables: { owners: [address], first: limit },
  };

  const response = await fetch('https://arweave.net/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error(`GraphQL query failed: ${response.status}`);
  }

  const json = await response.json() as {
    data?: {
      transactions?: {
        edges?: Array<{
          node: {
            id: string;
            owner?: { address?: string };
            tags?: Array<{ name: string; value: string }>;
            block?: { height?: number; timestamp?: number };
          };
        }>;
      };
    };
  };

  return json.data?.transactions?.edges?.map((edge) => edge.node) ?? [];
}

export async function searchTransactionsByTag(tagName: string, tagValue: string, limit = 10) {
  const query = {
    query: `
      query($tags: [TagFilter!], $first: Int!) {
        transactions(tags: $tags, first: $first, sort: HEIGHT_DESC) {
          edges {
            node {
              id
              owner { address }
              tags { name value }
              block { height timestamp }
            }
          }
        }
      }
    `,
    variables: {
      tags: [{ name: tagName, values: [tagValue] }],
      first: limit,
    },
  };

  const response = await fetch('https://arweave.net/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error(`GraphQL query failed: ${response.status}`);
  }

  const json = await response.json() as {
    data?: {
      transactions?: {
        edges?: Array<{
          node: {
            id: string;
            owner?: { address?: string };
            tags?: Array<{ name: string; value: string }>;
            block?: { height?: number; timestamp?: number };
          };
        }>;
      };
    };
  };

  return json.data?.transactions?.edges?.map((edge) => edge.node) ?? [];
}
