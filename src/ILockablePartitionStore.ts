import { Partition } from './IPartitionStore';
import { DataId, WithId } from './IStore';
import { TicketId, TicketType } from './LockableStore';

export interface ILockablePartitionStore {
  acquireTicket: (ticketType: TicketType) => Promise<TicketId>;
  returnTicket: (ticketId: TicketId) => Promise<void>;
  connect: (ticketId: TicketId) => Promise<void>;
  disconnect: (ticketId: TicketId) => Promise<void>;
  createWithoutId: <T>(ticketId: TicketId, partition: Partition, data: T) => Promise<WithId<T>>;
  read: <T>(ticketId: TicketId, partition: Partition, id: DataId) => Promise<WithId<T>>;
  readAll: <T>(ticketId: TicketId, partition: Partition) => Promise<WithId<T>[]>;
  update: <T>(ticketId: TicketId, partition: Partition, data: WithId<T>) => Promise<void>;
  delete: (ticketId: TicketId, partition: Partition, id: DataId) => Promise<void>;
}
