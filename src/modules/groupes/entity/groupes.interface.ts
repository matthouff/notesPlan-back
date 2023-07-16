import { IEntityStarter } from "src/modules/entity-starter.class";

interface IFixedPart { }

interface IMandatoryPart {
  libelle: string;
  id_repertoire: string;
}

interface IOptionalPart {
  couleur?: string | null;
}

export interface IGroupe
  extends IEntityStarter,
  Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  IOptionalPart { }

export interface IGroupeCreator extends Readonly<IFixedPart>, Required<IMandatoryPart>, IOptionalPart { }

export interface IGroupeConstructor
  extends Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  Partial<IOptionalPart> { }

export interface IGroupeResponse extends IGroupe { }

export interface IGroupeEditorMandatory extends Partial<IMandatoryPart> { }
export interface IGroupeEditorOptional extends IOptionalPart { }
export interface IGroupeEditor extends IGroupeEditorMandatory, IGroupeEditorOptional { }