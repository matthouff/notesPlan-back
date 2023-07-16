import { IEntityStarter } from "src/modules/entity-starter.class";

interface IFixedPart { }

interface IMandatoryPart {
  libelle: string;
  id_groupe: string;
}

interface IOptionalPart {
  couleur?: string | null;
  detail?: string | null;
  date?: string | null;
}

export interface ITache
  extends IEntityStarter,
  Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  IOptionalPart { }

export interface ITacheCreator extends Readonly<IFixedPart>, Required<IMandatoryPart>, IOptionalPart { }

export interface ITacheConstructor
  extends Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  Partial<IOptionalPart> { }

export interface ITacheResponse extends ITache { }

export interface ITacheEditorMandatory extends Partial<IMandatoryPart> { }
export interface ITacheEditorOptional extends IOptionalPart { }
export interface ITacheEditor extends ITacheEditorMandatory, ITacheEditorOptional { }