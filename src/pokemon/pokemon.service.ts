import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
   createPokemonDto.name = createPokemonDto.name.toUpperCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleEseption(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }
    
    if (!pokemon && isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ name: term.toUpperCase() });
    }
    
    if (!pokemon) {
      throw new NotFoundException(`Pokemon con el nombre, id ó no ${term} no encontrado`);
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toUpperCase();
    
    try {
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(), ...updatePokemonDto};
    } catch (error) {
      this.handleEseption(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return id;
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount } = await this. pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new NotFoundException(`Pokemon con el id ${id} no encontrado`);
    }
    return;
  }

 private handleEseption(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon already exists ${ JSON.stringify(error.keyValue) }`);
    }
    console.log(error);
    throw new InternalServerErrorException('Cant update/create pokemon'); 
  }
}
