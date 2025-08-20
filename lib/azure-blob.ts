import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob"
import { azureConfig } from "./azure-config"

class AzureBlobService {
  private blobServiceClient: BlobServiceClient
  private containerClient: ContainerClient

  constructor() {
    // Stub implementation - replace with actual Azure connection
    if (azureConfig.blob.connectionString.includes("placeholder")) {
      console.log("[v0] Azure Blob Storage not configured - using stub implementation")
      return
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(azureConfig.blob.connectionString)
    this.containerClient = this.blobServiceClient.getContainerClient(azureConfig.blob.containerName)
  }

  async uploadFile(file: File, fileName: string): Promise<string> {
    if (azureConfig.blob.connectionString.includes("placeholder")) {
      // Return placeholder URL for development
      return `/placeholder-uploads/${fileName}`
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName)
      const arrayBuffer = await file.arrayBuffer()

      await blockBlobClient.uploadData(arrayBuffer, {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      })

      return blockBlobClient.url
    } catch (error) {
      console.error("Error uploading file to Azure Blob:", error)
      throw new Error("Failed to upload file")
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    if (azureConfig.blob.connectionString.includes("placeholder")) {
      console.log("[v0] Stub: Would delete file:", fileName)
      return
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName)
      await blockBlobClient.delete()
    } catch (error) {
      console.error("Error deleting file from Azure Blob:", error)
      throw new Error("Failed to delete file")
    }
  }
}

export const azureBlobService = new AzureBlobService()

export async function uploadToBlob(file: File, fileName: string): Promise<string> {
  return azureBlobService.uploadFile(file, fileName)
}
