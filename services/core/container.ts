import { IService, IServiceContainer } from './interfaces';

export class ServiceContainer implements IServiceContainer {
  private services = new Map<string, IService>();
  private initializationOrder: string[] = [];

  register<T extends IService>(service: T): void {
    if (this.services.has(service.name)) {
      throw new Error(`Service '${service.name}' is already registered`);
    }

    this.services.set(service.name, service);
    this.initializationOrder.push(service.name);
  }

  unregister(name: string): void {
    if (!this.services.has(name)) {
      return;
    }

    const service = this.services.get(name)!;
    if (service.isInitialized) {
      service.dispose();
    }

    this.services.delete(name);
    const index = this.initializationOrder.indexOf(name);
    if (index > -1) {
      this.initializationOrder.splice(index, 1);
    }
  }

  get<T extends IService>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  getAll(): IService[] {
    return Array.from(this.services.values());
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  async initializeAll(): Promise<void> {
    const services = this.initializationOrder.map(name => this.services.get(name)!);

    for (const service of services) {
      if (!service.isInitialized) {
        await service.initialize();
      }
    }
  }

  async disposeAll(): Promise<void> {
    // Dispose in reverse order
    const services = this.initializationOrder
      .slice()
      .reverse()
      .map(name => this.services.get(name)!);

    for (const service of services) {
      if (service.isInitialized) {
        await service.dispose();
      }
    }
  }

  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  getInitializationOrder(): string[] {
    return [...this.initializationOrder];
  }
}

// Global service container instance
export const serviceContainer = new ServiceContainer();