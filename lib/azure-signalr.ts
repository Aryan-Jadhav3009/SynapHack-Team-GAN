import { type HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr"
import { azureConfig } from "./azure-config"

class AzureSignalRService {
  private connection: HubConnection | null = null

  async connect(userId: string): Promise<void> {
    if (azureConfig.signalr.connectionString.includes("placeholder")) {
      console.log("[v0] Azure SignalR not configured - using stub implementation")
      return
    }

    try {
      this.connection = new HubConnectionBuilder()
        .withUrl(`${azureConfig.signalr.connectionString}/${azureConfig.signalr.hubName}`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build()

      await this.connection.start()

      // Join user-specific group
      await this.connection.invoke("JoinUserGroup", userId)

      console.log("[v0] Connected to Azure SignalR")
    } catch (error) {
      console.error("Error connecting to Azure SignalR:", error)
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
    }
  }

  async joinHackathonGroup(hackathonId: string): Promise<void> {
    if (!this.connection || azureConfig.signalr.connectionString.includes("placeholder")) {
      console.log("[v0] Stub: Would join hackathon group:", hackathonId)
      return
    }

    try {
      await this.connection.invoke("JoinHackathonGroup", hackathonId)
    } catch (error) {
      console.error("Error joining hackathon group:", error)
    }
  }

  async sendTeamUpdate(teamId: string, update: any): Promise<void> {
    if (!this.connection || azureConfig.signalr.connectionString.includes("placeholder")) {
      console.log("[v0] Stub: Would send team update:", { teamId, update })
      return
    }

    try {
      await this.connection.invoke("SendTeamUpdate", teamId, update)
    } catch (error) {
      console.error("Error sending team update:", error)
    }
  }

  onTeamUpdate(callback: (teamId: string, update: any) => void): void {
    if (!this.connection) return

    this.connection.on("TeamUpdate", callback)
  }

  onHackathonUpdate(callback: (hackathonId: string, update: any) => void): void {
    if (!this.connection) return

    this.connection.on("HackathonUpdate", callback)
  }
}

export const azureSignalRService = new AzureSignalRService()
