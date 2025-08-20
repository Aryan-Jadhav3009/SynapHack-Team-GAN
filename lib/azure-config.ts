export const azureConfig = {
  sql: {
    connectionString: process.env.AZURE_SQL_CONNECTION_STRING || "placeholder-azure-sql-connection-string",
  },
  blob: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || "placeholder-azure-storage-connection-string",
    containerName: process.env.AZURE_STORAGE_CONTAINER || "synaphack-uploads",
  },
  signalr: {
    connectionString: process.env.AZURE_SIGNALR_CONNECTION_STRING || "placeholder-azure-signalr-connection-string",
    hubName: "synaphack-hub",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-jwt-secret-key",
    expiresIn: "7d",
  },
}
