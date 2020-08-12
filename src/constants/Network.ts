export interface INetworkConfiguration {
    API_URL:string;
    TIMEOUT: number;
    CLIENT_ID: string;
    AUTHORITY: string;
    RESOURCE_URI: string;
    REDIRECT_URI: string;
    GOOGLE_API_KEY: string;
}

export const DEV_Network : INetworkConfiguration = {
  //API_URL: 'http://52.76.162.242:8082',
  API_URL: 'https://dev-cleanair.azurewebsites.net',
  //API_URL: 'http://10.113.19.125:8082',
  TIMEOUT: 30000, // response timeout
  CLIENT_ID: '8a8be25c-f92b-4d75-953d-855e547107e1',
  AUTHORITY: 'https://login.microsoftonline.com/common/oauth2/authorize',
  RESOURCE_URI: 'https://graph.microsoft.com',
  REDIRECT_URI: 'msal8a8be25c-f92b-4d75-953d-855e547107e1://auth',
  GOOGLE_API_KEY: 'AIzaSyAJJDI1NSoMwkVu9QfU61s1Z-FmWgxbWhs',
};

export const PRD_Network : INetworkConfiguration = {
    //API_URL: 'http://52.76.162.242:8082',
    API_URL: 'https://dev-cleanair.azurewebsites.net',
    //API_URL: 'http://10.113.19.125:8082',
    TIMEOUT: 30000, // response timeout
    CLIENT_ID: '8a8be25c-f92b-4d75-953d-855e547107e1',
    AUTHORITY: 'https://login.microsoftonline.com/common/oauth2/authorize',
    RESOURCE_URI: 'https://graph.microsoft.com',
    REDIRECT_URI: 'msal8a8be25c-f92b-4d75-953d-855e547107e1://auth',
    GOOGLE_API_KEY: 'AIzaSyAJJDI1NSoMwkVu9QfU61s1Z-FmWgxbWhs',
  };