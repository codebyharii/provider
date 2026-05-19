type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
};

class SSEManager {
  private clients: Set<Client> = new Set();

  addClient(client: Client) {
    this.clients.add(client);
  }

  removeClient(client: Client) {
    this.clients.delete(client);
  }

  broadcast(data: any) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(client => {
      try {
        client.controller.enqueue(new TextEncoder().encode(payload));
      } catch (err) {
        this.removeClient(client);
      }
    });
  }
}

export const sseManager = new SSEManager();
