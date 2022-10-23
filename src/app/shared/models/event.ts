import { BaseEntity } from './base-entity';

export class Event extends BaseEntity {
  title: string;
  startDate: string;
  endDate: string;
  specialIngredient: string;
  prize: string;
  description: string;
}
