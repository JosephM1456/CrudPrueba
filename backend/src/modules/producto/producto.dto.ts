import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo: string;

  @IsString()
  @IsNotEmpty({ message: 'El código es requerido' })
  codigo: string;

  @IsNumber()
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  precioVenta: number;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateProductoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  precioVenta?: number;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
