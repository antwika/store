import { DataId, WithId } from './IStore';
import { TicketId, TicketType } from './LockableStore';

export interface ILockableStore {
  acquireTicket: (ticketType: TicketType) => Promise<TicketId>;
  returnTicket: (ticketId: TicketId) => Promise<void>;
  connect: (ticketId: TicketId) => Promise<void>;
  disconnect: (ticketId: TicketId) => Promise<void>;
  createWithoutId: <T>(ticketId: TicketId, data: T) => Promise<WithId<T>>;
  read: <T>(ticketId: TicketId, id: DataId) => Promise<WithId<T>>;
  readAll: <T>(ticketId: TicketId) => Promise<WithId<T>[]>;
  update: <T>(ticketId: TicketId, data: WithId<T>) => Promise<void>;
  delete: (ticketId: TicketId, id: DataId) => Promise<void>;
}
