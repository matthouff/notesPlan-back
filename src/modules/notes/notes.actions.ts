import { Logger } from "@nestjs/common";
import { Note } from "./entity/notes";
import { NoteRepository } from "./notes.repository";

export class NoteActions {
	constructor(private readonly noteRepository: NoteRepository, private readonly logger: Logger) { }


	//
	// Update le note ciblé avec note et InoteEditor passé en paramettre
	//
	// updatenoteValidation(note: note, updatenoteDto: InoteEditor): note {
	// 	const data: InoteEditor = {
	// 		...updatenoteDto,
	// 	};

	// 	note.edit(data);

	// 	this.logger.debug(`Le note a été mis à jour`);

	// 	return note;
	// }

	//
	// On récupère le note avec l'id passé en parametre
	//
	// async getnoteById(id: string): Promise<note> {
	// 	const found = await this.noteRepository.findByID(id);

	// 	if (!found) {
	// 		this.logger.debug(`Aucun note n'a été récupéré pour l'id "${id}"`);
	// 		throw new NotFoundException(`Aucun note n'a été récupéré pour l'id "${id}"`);
	// 	}

	// 	this.logger.debug(`Le note a été récupéré`);

	// 	return found;
	// }

	// async removenoteById(id: string): Promise<boolean> {
	// 	const deleted = await this.noteRepository.deleteByID(id);

	// 	this.logger.debug(`Le note a été supprimé`);

	// 	return deleted;
	// }

	async savenoteToDatabase(noteEntity: Note): Promise<Note> {
		const note = await this.noteRepository.save(noteEntity);

		this.logger.debug(`Le note a été sauvegardé dans la base de données`);

		return note;
	}
}
