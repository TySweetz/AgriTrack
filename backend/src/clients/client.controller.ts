import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto, UpdateClientDto } from './client.dto';

/**
 * Contrôleur pour la gestion des clients
 */
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  /**
   * GET /clients - Récupère tous les clients
   */
  @Get()
  async findAll() {
    return this.clientService.findAll();
  }

  /**
   * GET /clients/:id - Récupère un client
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  /**
   * POST /clients - Crée un nouveau client
   */
  @Post()
  async create(@Body() dto: CreateClientDto) {
    return this.clientService.create(dto);
  }

  /**
   * PATCH /clients/:id - Met à jour un client
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientService.update(id, dto);
  }

  /**
   * DELETE /clients/:id - Supprime un client
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
