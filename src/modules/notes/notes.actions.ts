import { Logger } from "@nestjs/common";
import { Note } from "./entity/notes";
import { NoteRepository } from "./notes.repository";

export class NoteActions {
	constructor(private readonly noteRepository: NoteRepository, private readonly logger: Logger) { }

	/**
		 * Sauvegarde une note dans la base de données.
		 * @param noteEntity L'entité Note à sauvegarder.
		 * @returns La note sauvegardée.
		 */
	async savenoteToDatabase(noteEntity: Note): Promise<Note> {
		const note = await this.noteRepository.save(noteEntity);

		this.logger.debug(`Le note a été sauvegardé dans la base de données`);

		return note;
	}
}
