import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('producto')
export class Producto {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  idProducto: string;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'varchar', length: 100 })
  tipo: string;

  @Column({ type: 'varchar', length: 50 })
  codigo: string;

  @Column({ type: 'float' })
  precioVenta: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  marca: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  // Campos de compatibilidad para referencias tipadas en entidades legacy.
  empresa?: unknown;
  categoriaRel?: unknown;
  stocks?: unknown[];
}
