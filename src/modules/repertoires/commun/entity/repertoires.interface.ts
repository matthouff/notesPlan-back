import { IEntityStarter } from "src/modules/entity-starter.class";

interface IFixedPart { }

interface IMandatoryPart {
  re_libelle: string;
  id_user: string;
}

interface IOptionalPart { }

export interface IRepertoire
  extends IEntityStarter,
  Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  IOptionalPart { }

export interface IRepertoireCreator extends Readonly<IFixedPart>, Required<IMandatoryPart>, IOptionalPart { }

export interface IRepertoireConstructor
  extends Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  Partial<IOptionalPart> { }

export interface IRepertoireResponse extends IRepertoire { }

export interface IRepertoireEditorMandatory extends Partial<IMandatoryPart> { }
export interface IRepertoireEditorOptional extends IOptionalPart { }
export interface IRepertoireEditor extends IRepertoireEditorMandatory, IRepertoireEditorOptional { }



// export interface IRepertoire {
//   id: number;
//   us_nom: string | null;
//   us_prenom: string | null;
//   us_email: string | null;
//   us_login: string | null;
//   us_password: string | null;
// }