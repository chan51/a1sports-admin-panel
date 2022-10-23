import { BaseEntity } from './base-entity';

export class Player extends BaseEntity {
  name: string;
  team: string;
  role: string;
  value: number;
}
