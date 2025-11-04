import axios, {
  AxiosInstance,
  CreateAxiosDefaults,
  HttpStatusCode,
  isAxiosError,
} from 'axios';

export interface StandByClientConfig {
  clientId: string;
  clientSecret: string;
  environment: 'production' | 'development';
  axiosConfig?: Omit<CreateAxiosDefaults, 'baseURL'>;
}

interface AuthToken {
  accessToken: string;
  expiresIn: number;
}

const ENVIRONMENTS = {
  production: 'https://api.standby.com.mx',
  development: 'https://dev.api.standby.com.mx',
};

export class HttpClient {
  readonly client: AxiosInstance;
  private authInterceptorId: number | undefined = undefined;
  private accessToken: string | undefined = undefined;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(private readonly config: StandByClientConfig) {
    this.client = axios.create({
      baseURL: ENVIRONMENTS[config.environment],
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      ...config.axiosConfig,
    });

    this.configAuthTokenInterceptor();
    this.configRefreshTokenInterceptor();
  }

  private configAuthTokenInterceptor(): void {
    if (this.authInterceptorId) {
      this.client.interceptors.request.eject(this.authInterceptorId);
    }

    this.authInterceptorId = this.client.interceptors.request.use(
      async (reqConfig) => {
        reqConfig.headers['Authorization'] = `Bearer ${this.accessToken ?? ''}`;
        return reqConfig;
      },
    );
  }

  private configRefreshTokenInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === HttpStatusCode.Unauthorized) {
            if (this.retryCount > this.maxRetries) throw error;
            this.retryCount++;
            await this.authenticate();
            this.configAuthTokenInterceptor();
            if (error.config) {
              return this.client.request(error.config);
            }
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private async authenticate(): Promise<void> {
    const { data } = await this.client.post<AuthToken>(
      `/auth/customer-credentials/token`,
      {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
      },
    );

    this.accessToken = data.accessToken;
    this.retryCount = 0;
  }
}
