import { BaseEntity } from './base-entity';

export class Schedule extends BaseEntity {
  teamId: string;
  teamName: string;
  date: string;
}
