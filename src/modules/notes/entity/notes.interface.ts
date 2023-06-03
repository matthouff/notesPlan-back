import { IEntityStarter } from "src/modules/entity-starter.class";

interface IFixedPart { }

interface IMandatoryPart {
  id_repertoire: string;
}

interface IOptionalPart {
  no_libelle?: string | null,
  no_message?: string | null,
}

export interface INote
  extends IEntityStarter,
  Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  IOptionalPart { }

export interface INoteCreator extends Readonly<IFixedPart>, Required<IMandatoryPart>, IOptionalPart { }

export interface INoteConstructor
  extends Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  Partial<IOptionalPart> { }

export interface INoteResponse extends INote { }

export interface INoteEditorMandatory extends Partial<IMandatoryPart> { }
export interface INoteEditorOptional extends IOptionalPart { }
export interface INoteEditor extends INoteEditorMandatory, INoteEditorOptional { }