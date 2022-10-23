import { BaseEntity } from './base-entity';

export class Archive extends BaseEntity {
  title: string;
  specialIngredient: string;
  prize: string;
  description: string;
}
