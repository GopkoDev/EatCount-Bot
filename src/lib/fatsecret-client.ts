import { config } from '../../envconfig.js';
import logger from './logger.js';

interface FatSecretClientConfig {
  clientId: string;
  clientSecret: string;
}

export interface FoodSearchResult {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
  brand_name?: string;
  food_description?: string;
}

export interface FoodSearchResponse {
  foods: {
    food: FoodSearchResult[];
    max_results: number;
    total_results: number;
    page_number: number;
  };
}

export interface Serving {
  serving_id: number;
  serving_description: string;
  serving_url: string;
  metric_serving_amount: number;
  metric_serving_unit: string;
  number_of_units: number;
  measurement_description: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  saturated_fat: number;
  polyunsaturated_fat: number;
  monounsaturated_fat: number;
  cholesterol: number;
  sodium: number;
  potassium: number;
  fiber: number;
  sugar: number;
  vitamin_a: number;
  vitamin_c: number;
  calcium: number;
  iron: number;
  trans_fat?: number;
  added_sugars?: number;
  vitamin_d?: number;
}

export interface FoodDetails {
  food_id: string;
  food_name: string;
  food_type: string;
  food_description: string;
  servings: {
    serving: Serving[];
  };
}

export interface FoodDetailsResponse {
  food: FoodDetails;
}

interface IFatSecretClient {
  initialize(): Promise<void>;
  searchFood(query: string): Promise<FoodSearchResponse>;
  getFoodById(foodId: string): Promise<FoodDetailsResponse>;
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
      logger.info('[FatSecret API]: client initialized successfully');
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

  public searchFood = async (query: string): Promise<FoodSearchResponse> => {
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
      if (response.status === 401) {
        this.accesToken = null;
        await this.initialize();
        return this.searchFood(query);
      }

      throw new Error(
        `Failed to search foods: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  };

  public getFoodById = async (foodId: string): Promise<FoodDetailsResponse> => {
    if (!this.accesToken) {
      throw new Error(
        '[FatSecret API]: client not initialized. Call initialize() first.'
      );
    }

    const response = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=food.get.v4&food_id=${foodId}&format=json`,
      {
        headers: {
          Authorization: `Bearer ${this.accesToken}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        this.accesToken = null;
        await this.initialize();
        return this.getFoodById(foodId);
      }

      throw new Error(
        `Failed to get food by ID: ${response.status} ${response.statusText}`
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

export const getFatSecretClient = async (): Promise<IFatSecretClient> => {
  if (!fatSecretClient) {
    await initFatSecretClient(
      config.fatSecret.clientId,
      config.fatSecret.clientSecret
    );
  }

  return fatSecretClient!;
};
