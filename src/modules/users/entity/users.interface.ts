import { IEntityStarter } from "src/modules/entity-starter.class";

interface IFixedPart { }

interface IMandatoryPart {
  prenom: string
  email: string
  login: string
  password: string
}

interface IOptionalPart {
  nom?: string | null;
}

export interface IUser
  extends IEntityStarter,
  Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  IOptionalPart { }

export interface IUserCreator extends Readonly<IFixedPart>, Required<IMandatoryPart>, IOptionalPart { }

export interface IUserConstructor
  extends Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  Partial<IOptionalPart> { }

export interface IUserResponse extends IUser { }

export interface IUserEditorMandatory extends Partial<IMandatoryPart> { }
export interface IUserEditorOptional extends IOptionalPart { }
export interface IUserEditor extends IUserEditorMandatory, IUserEditorOptional { }
