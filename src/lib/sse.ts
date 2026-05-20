type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
};

class SSEManager {
  private clients: Set<Client> = new Set();

  addClient(client: Client) {
    this.clients.add(client);
  }

  removeClient(clientId: string) {
    this.clients.forEach(client => {
      if (client.id === clientId) {
        this.clients.delete(client);
      }
    });
  }

  broadcast(data: unknown) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(client => {
      try {
        client.controller.enqueue(new TextEncoder().encode(payload));
      } catch {
        this.removeClient(client.id);
      }
    });
  }
}

export const sseManager = new SSEManager();
