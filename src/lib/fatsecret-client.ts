import logger from './logger.js';

interface FatSecretClientConfig {
  clientId: string;
  clientSecret: string;
}

interface IFatSecretClient {
  initialize(): Promise<void>;
  searchFoods(query: string): Promise<any>;
}

class FatSecretClient implements IFatSecretClient {
  private clientId: string;
  private clientSecret: string;
  private accesToken: string | null = null;

  constructor({ clientId, clientSecret }: FatSecretClientConfig) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public async initialize() {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        '[FatSecret API]: credentials are not set in environment variables'
      );
    }

    try {
      const token = await this.getFatSecretToken();
      this.accesToken = token.access_token;
      logger.info('[FatSecret API] client initialized successfully');
    } catch (error) {
      logger.error('[FatSecret API]: Error initializing client:', error);
      throw error;
    }
  }

  private async getFatSecretToken(): Promise<{
    access_token: string;
    expires_in: number;
    token_type: string;
  }> {
    const { clientId, clientSecret } = this;

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('scope', 'basic');

      const response = await fetch(
        'https://oauth.fatsecret.com/connect/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get FatSecret token: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('Error fetching FatSecret token:', error);
      throw error;
    }
  }

  public searchFoods = async (query: string) => {
    if (!this.accesToken) {
      throw new Error(
        '[FatSecret API]: client not initialized. Call initialize() first.'
      );
    }

    const response = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(
        query
      )}&format=json`,
      {
        headers: {
          Authorization: `Bearer ${this.accesToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to search foods: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  };
}

let fatSecretClient: FatSecretClient | null = null;

export const initFatSecretClient = async (
  clientId: string,
  clientSecret: string
) => {
  fatSecretClient = new FatSecretClient({ clientId, clientSecret });
  await fatSecretClient.initialize();
};

export const getFatSecretClient = (): IFatSecretClient => {
  if (!fatSecretClient) {
    throw new Error('[FatSecret API]: client not initialized');
  }
  return fatSecretClient;
};
