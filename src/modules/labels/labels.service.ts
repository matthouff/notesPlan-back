import { Injectable } from "@nestjs/common";
import { EditLabelDto } from "./dto/labels-edit.dto";
import { Label } from "./entity/labels";
import { ILabel } from "./entity/labels.interface";
import { LabelRepository } from "./labels.repository";

@Injectable()
export class LabelService {

  constructor(readonly labelsRepository: LabelRepository) { }

  async findAll(): Promise<ILabel[]> {
    return await this.labelsRepository.getAll();
  }

  async create(data: Label): Promise<Label> {
    return await this.labelsRepository.save(data);
  }

  async findById(id: string): Promise<Label> {
    return await this.labelsRepository.findByID(id);
  }

  async delete(id: string) {
    return await this.labelsRepository.deleteByID(id);
  }

  async update(editlabelsDto: EditLabelDto, id: string) {
    let labels = await this.labelsRepository.findByID(id);

    labels.edit(editlabelsDto);

    return await this.labelsRepository.save(labels);
  }
}
