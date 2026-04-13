import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto, UpdateProductoDto } from './producto.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProductoService {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
  ) {}

  async findAll(): Promise<Producto[]> {
    return this.repo.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Producto> {
    const producto = await this.repo.findOne({
      where: { idProducto: id },
    });
    if (!producto) throw new NotFoundException(`Producto ${id} no encontrado`);
    return producto;
  }

  async create(dto: CreateProductoDto): Promise<Producto> {
    const existing = await this.repo.findOne({
      where: { codigo: dto.codigo },
    });
    if (existing) {
      throw new BadRequestException(`Ya existe un producto con el código ${dto.codigo}`);
    }
    const producto = this.repo.create({
      idProducto: uuid(),
      activo: true,
      ...dto,
    });
    return this.repo.save(producto);
  }

  async update(id: string, dto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);
    if (dto.codigo) {
      const existing = await this.repo.findOne({
        where: { codigo: dto.codigo },
      });
      if (existing && existing.idProducto !== id) {
        throw new BadRequestException(`Ya existe un producto con el código ${dto.codigo}`);
      }
    }
    Object.assign(producto, dto);
    return this.repo.save(producto);
  }

  async remove(id: string): Promise<void> {
    const producto = await this.findOne(id);
    await this.repo.remove(producto);
  }

  async toggleActive(id: string): Promise<Producto> {
    const producto = await this.findOne(id);
    producto.activo = !producto.activo;
    return this.repo.save(producto);
  }
}
