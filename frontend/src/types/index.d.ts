interface AuthState {
  token: string;
  user: {
    id: number;
    role: string;
    fullname: string;
    username: string;
    email: string;
    balance: number;
    transactions: any[];
    coverages: any[];
    claims: string[];
    address: ?{
      line1: string;
      line2: ?string;
      city: string;
      latitude: number;
      longitude: number;
    };
  };
}

interface CoverageState {
  coverages: any[];
}

interface WeatherState {
  weathers: any[];
}

interface ClientState {
  clients: any[];
  client: any;
  validators: any[];
}

interface ClaimState {
  claims: any[];
  active: any[];
  past: any[];
  assessed: any[];
  assigned: any[];
}