import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from './client.entity';
import { CreateClientDto, UpdateClientDto } from './client.dto';

/**
 * Service pour la gestion des clients
 */
@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  /**
   * Récupère tous les clients
   */
  async findAll() {
    return this.clientRepository.find({
      order: { nom: 'ASC' },
    });
  }

  /**
   * Récupère un client par ID
   */
  async findOne(id: string) {
    return this.clientRepository.findOne({ where: { id } });
  }

  /**
   * Crée un nouveau client
   */
  async create(dto: CreateClientDto) {
    const client = this.clientRepository.create(dto);
    return this.clientRepository.save(client);
  }

  /**
   * Met à jour un client
   */
  async update(id: string, dto: UpdateClientDto) {
    await this.clientRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Supprime un client
   */
  async remove(id: string) {
    await this.clientRepository.delete(id);
    return { message: 'Client supprimé avec succès' };
  }
}
