import { IEntityStarter } from "src/modules/entity-starter.class";

interface IFixedPart { }

interface IMandatoryPart {
}

interface IOptionalPart {
  libelle?: string | null;
  couleur?: string | null;
}

export interface ILabel
  extends IEntityStarter,
  Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  IOptionalPart { }

export interface ILabelCreator extends Readonly<IFixedPart>, Required<IMandatoryPart>, IOptionalPart { }

export interface ILabelConstructor
  extends Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  Partial<IOptionalPart> { }

export interface ILabelResponse extends ILabel { }

export interface ILabelEditorMandatory extends Partial<IMandatoryPart> { }
export interface ILabelEditorOptional extends IOptionalPart { }
export interface ILabelEditor extends ILabelEditorMandatory, ILabelEditorOptional { }