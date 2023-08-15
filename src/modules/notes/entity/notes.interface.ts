import { IEntityStarter } from 'src/modules/entity-starter.class';
import { RepertoireNote } from 'src/modules/repertoires/repertoires-notes/entity/repertoires-notes';

interface IFixedPart { }

interface IMandatoryPart {
  libelle: string;
}

interface IOptionalPart {
  repertoire?: RepertoireNote | null;
  message?: string | null;
}

export interface INote
  extends IEntityStarter,
  Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  IOptionalPart { }

export interface INoteCreator
  extends Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  IOptionalPart { }

export interface INoteConstructor
  extends Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  Partial<IOptionalPart> { }

export interface INoteResponse extends INote { }

export interface INoteEditorMandatory extends Partial<IMandatoryPart> { }
export interface INoteEditorOptional extends IOptionalPart { }
export interface INoteEditor
  extends INoteEditorMandatory,
  INoteEditorOptional { }
