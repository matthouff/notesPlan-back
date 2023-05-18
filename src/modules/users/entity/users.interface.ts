import { IEntityStarter } from "src/modules/entity-starter.class";

interface IFixedPart { }

interface IMandatoryPart {
  us_prenom: string
  us_email: string
  us_login: string
  us_password: string
}

interface IOptionalPart {
  us_nom?: string | null;
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



// export interface IUser {
//   id: number;
//   us_nom: string | null;
//   us_prenom: string | null;
//   us_email: string | null;
//   us_login: string | null;
//   us_password: string | null;
// }