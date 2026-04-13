import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoModule } from './modules/producto/producto.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'multiempresa.db',
      autoLoadEntities: true,
      synchronize: true, // Solo para prototipo/demo
    }),
    ProductoModule,
  ],
})
export class AppModule {}
