import { IStore } from './IStore';
import { Migration } from './schema/Migration';

type MigrationStatus = {
  atTimestamp: Date,
};

export class Migrator {
  private migrationStatus: MigrationStatus;

  constructor() {
    this.migrationStatus = {
      atTimestamp: new Date('1970-01-01'),
    };
  }

  async upgrade(store: IStore, migrations: Migration[]) {
    const sorted = migrations.sort((a, b) => (
      new Date(a.timestamp) > new Date(b.timestamp) ? 1 : -1
    ));

    console.log('sorted migrations:', sorted);

    for (const migration of migrations) {
      if (new Date(migration.timestamp) <= this.migrationStatus.atTimestamp) {
        console.log(`Already migrated: ${migration.name}`);
        // eslint-disable-next-line no-continue
        continue;
      }

      console.log(`Running migration: ${migration.name}`);
      // eslint-disable-next-line no-await-in-loop
      await migration.up(store);

      console.log('setting atTimestamp:', new Date(migration.timestamp));
      this.migrationStatus.atTimestamp = new Date(migration.timestamp);
    }
  }

  async downgrade(store: IStore, migrations: Migration[]) {
    const sorted = migrations.sort((a, b) => (
      new Date(a.timestamp) <= new Date(b.timestamp) ? 1 : -1
    ));

    console.log('reverse sorted migrations:', sorted);

    for (const migration of migrations) {
      if (new Date(migration.timestamp) > this.migrationStatus.atTimestamp) {
        console.log(`Already migrated: ${migration.name}`);
        // eslint-disable-next-line no-continue
        continue;
      }

      console.log(`Running migration (downgrade): ${migration.name}`);
      // eslint-disable-next-line no-await-in-loop
      await migration.down(store);

      console.log('setting atTimestamp:', new Date(migration.timestamp));
      this.migrationStatus.atTimestamp = new Date(migration.timestamp);
    }
  }
}
